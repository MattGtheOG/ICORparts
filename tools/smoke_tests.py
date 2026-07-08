from __future__ import annotations

import json
import sqlite3
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
ROOT = Path(__file__).resolve().parents[1]
ADMIN_PASSWORD = "OffroadOG"
TEST_EMPLOYEE = "Smoke Test Manager"
TEST_USERNAME = "smokemanager"
TEST_BRAND = "Smoke Test Brand"
TEST_PART = "Smoke Test Filter"


def call(method: str, path: str, payload: dict | None = None, department: str = "parts"):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json", "X-PPWork-Department": department},
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            raw_body = response.read()
            content_type = response.headers.get("Content-Type", "")
            if content_type.startswith("application/json"):
                return json.loads(raw_body.decode("utf-8") or "{}")
            if content_type.startswith("application/zip"):
                return raw_body
            return raw_body.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise AssertionError(f"{method} {path} failed with {error.code}: {body}") from error


def cleanup() -> None:
    for db_name in ("parts.db", "service.db"):
        db_path = ROOT / db_name
        if not db_path.exists():
            continue
        with sqlite3.connect(db_path) as db:
            brand_ids = [row[0] for row in db.execute("SELECT id FROM brands WHERE name LIKE ?", (f"{TEST_BRAND}%",)).fetchall()]
            for brand_id in brand_ids:
                db.execute("DELETE FROM parts WHERE brand_id = ?", (brand_id,))
                db.execute("DELETE FROM brands WHERE id = ?", (brand_id,))
            employee_ids = [row[0] for row in db.execute("SELECT id FROM employees WHERE name = ?", (TEST_EMPLOYEE,)).fetchall()] if db_name == "parts.db" else []
            for employee_id in employee_ids:
                db.execute("DELETE FROM employee_favorites WHERE employee_id = ?", (employee_id,))
                db.execute("DELETE FROM employee_copy_activity WHERE employee_id = ?", (employee_id,))
                db.execute("DELETE FROM employee_sessions WHERE employee_id = ?", (employee_id,))
                db.execute("DELETE FROM employees WHERE id = ?", (employee_id,))



def version_parts(value: str) -> tuple[int, ...]:
    parts: list[int] = []
    for chunk in str(value or "").split("."):
        try:
            parts.append(int(chunk))
        except ValueError:
            parts.append(0)
    return tuple(parts or [0])

def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    cleanup()
    employee_id = None
    try:
        version = call("GET", "/api/version")
        assert_true(version_parts(version.get("version")) >= version_parts("0.8.0"), "App version should be 0.8.0 or newer")

        settings = call("GET", "/api/settings")
        assert_true(settings.get("dealershipName"), "Settings should load dealership name")

        parts_summary = call("GET", "/api/summary", department="parts")
        service_summary = call("GET", "/api/summary", department="service")
        assert_true("active" in parts_summary and "active" in service_summary, "Department summaries should load")

        employee = call("POST", "/api/employees", {
            "name": TEST_EMPLOYEE,
            "role": "manager",
            "pin": "2468",
            "adminPassword": ADMIN_PASSWORD,
        })
        employee_id = employee["id"]
        login = call("POST", "/api/employees/login", {"employeeId": employee_id, "pin": "2468"})
        session = {"employeeId": employee_id, "sessionToken": login["sessionToken"]}
        assert_true(login.get("role") == "manager" and login.get("sessionToken"), "Manager login should return a session token")

        backup = call("POST", "/api/admin/backup", session, department="service")
        assert_true(backup.get("ok") and backup.get("fileName"), "Manager session should authorize backup creation")

        brand = call("POST", "/api/brands", {**session, "name": TEST_BRAND, "accent": "#2563eb"}, department="service")
        part = call("POST", "/api/parts", {
            "brand": TEST_BRAND,
            "family": "Smoke",
            "model": "Verification",
            "category": "Filters",
            "item": TEST_PART,
            "partNumber": "SMOKE-123",
            "vendor": "Test Vendor",
        }, department="service")
        part_id = str(part["id"])

        call("PUT", "/api/employee-favorites", {**session, "partIds": [part_id]}, department="service")
        favorites = call("GET", f"/api/employee-favorites?employeeId={employee_id}", department="service")
        assert_true(part_id in favorites.get("partIds", []), "Employee favorites should save by account and department")

        call("POST", "/api/copy-activity", {"employeeId": employee_id, "partId": part_id}, department="service")
        copy_activity = call("GET", "/api/reports/copy-activity?limit=5", department="service")
        assert_true(any(row.get("employeeName") == TEST_EMPLOYEE for row in copy_activity), "Copy activity should include signed-in employee")

        call("DELETE", f"/api/brands/{brand['id']}", {**session, "archiveNote": "Smoke test archive"}, department="service")
        saved = call("GET", "/api/brands/saved", department="service")
        assert_true(any(row.get("name") == TEST_BRAND for row in saved), "Deleted brand should appear in saved brands")

        call("POST", f"/api/brands/{brand['id']}/restore", session, department="service")
        active = call("GET", "/api/brands", department="service")
        assert_true(any(row.get("name") == TEST_BRAND for row in active), "Saved brand should restore")

        call("DELETE", f"/api/brands/{brand['id']}", {**session, "archiveNote": "Smoke test permanent cleanup"}, department="service")
        call("DELETE", f"/api/brands/{brand['id']}/permanent", {"adminPassword": ADMIN_PASSWORD}, department="service")

        migrations = call("GET", "/api/admin/migrations")
        assert_true(any(row.get("department") == "parts" for row in migrations), "Migration report should include Parts")

        logs = call("GET", "/api/admin/logs?limit=5")
        assert_true(isinstance(logs, list), "Error log endpoint should return a list")

        demo = call("GET", "/api/demo-database")
        assert_true(isinstance(demo, bytes) and demo.startswith(b"PK"), "Demo database download should return a ZIP file")

        call("DELETE", f"/api/employees/{employee_id}", {"adminPassword": ADMIN_PASSWORD})
        employee_id = None
        print("Smoke tests passed")
    finally:
        cleanup()


if __name__ == "__main__":
    main()
