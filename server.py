from __future__ import annotations

import argparse
import base64
import binascii
import hashlib
import json
import mimetypes
import re
import secrets
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
ASSETS_DIR = STATIC_DIR / "assets"
DEFAULT_DEPARTMENT = "parts"
DEPARTMENTS = {
    "parts": {"label": "Parts", "db": BASE_DIR / "parts.db", "seed": True},
    "service": {"label": "Service", "db": BASE_DIR / "service.db", "seed": False},
}
ADMIN_PASSWORD_HASH = "1fe8359332f00ab7dde21a97ba3603eb06b8f68266c0a7e9e7582f0efc039dd0"
SEED_PATH = BASE_DIR / "seed-data.json"
MAX_JSON_BYTES = 8 * 1024 * 1024
LOGO_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def normalize_department(value: object) -> str:
    department = str(value or "").strip().lower()
    if department in DEPARTMENTS:
        return department
    return DEFAULT_DEPARTMENT


def db_path_for_department(department: str) -> Path:
    return DEPARTMENTS[normalize_department(department)]["db"]


def department_label(department: str) -> str:
    return DEPARTMENTS[normalize_department(department)]["label"]


def valid_admin_password(value: object) -> bool:
    digest = hashlib.sha256(clean_text(value).encode("utf-8")).hexdigest()
    return secrets.compare_digest(digest, ADMIN_PASSWORD_HASH)


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect(department: str = DEFAULT_DEPARTMENT) -> sqlite3.Connection:
    connection = sqlite3.connect(db_path_for_department(department))
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    for department, config in DEPARTMENTS.items():
        with connect(department) as db:
            db.executescript(
                """
                CREATE TABLE IF NOT EXISTS brands (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    accent TEXT NOT NULL DEFAULT '#2563eb',
                    logo TEXT NOT NULL DEFAULT '',
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    active INTEGER NOT NULL DEFAULT 1,
                    archived_at TEXT NOT NULL DEFAULT '',
                    deleted_at TEXT NOT NULL DEFAULT '',
                    deleted_name TEXT NOT NULL DEFAULT ''
                );

                CREATE TABLE IF NOT EXISTS parts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
                    family TEXT NOT NULL DEFAULT '',
                    model TEXT NOT NULL DEFAULT '',
                    category TEXT NOT NULL DEFAULT '',
                    item TEXT NOT NULL,
                    button_text TEXT NOT NULL DEFAULT '',
                    part_number TEXT NOT NULL DEFAULT '',
                    notes TEXT NOT NULL DEFAULT '',
                    source TEXT NOT NULL DEFAULT '',
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand_id);
                CREATE INDEX IF NOT EXISTS idx_parts_lookup ON parts(active, family, model, category, item);
                """
            )
            ensure_brand_archive_columns(db)
            db.execute("CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(active, sort_order)")
            brand_count = db.execute("SELECT COUNT(*) FROM brands").fetchone()[0]
            part_count = db.execute("SELECT COUNT(*) FROM parts").fetchone()[0]

            if config["seed"] and brand_count == 0 and part_count == 0 and SEED_PATH.exists():
                seed_database(db)


def seed_database(db: sqlite3.Connection) -> None:
    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    stamp = now_iso()

    for index, brand in enumerate(data.get("brands", []), start=1):
        db.execute(
            """
            INSERT INTO brands (name, accent, logo, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (
                clean_text(brand.get("name")),
                clean_text(brand.get("accent")) or "#2563eb",
                clean_text(brand.get("logo")),
                index,
            ),
        )

    brand_ids = {row["name"]: row["id"] for row in db.execute("SELECT id, name FROM brands")}
    for part in data.get("parts", []):
        brand_name = clean_text(part.get("brand"))
        brand_id = brand_ids.get(brand_name)
        if not brand_id:
            continue

        db.execute(
            """
            INSERT INTO parts (
                brand_id, family, model, category, item, button_text, part_number,
                notes, source, sort_order, active, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                brand_id,
                clean_text(part.get("family")),
                clean_text(part.get("model")),
                clean_text(part.get("category")),
                clean_text(part.get("item")) or "Untitled Part",
                clean_text(part.get("buttonText")),
                clean_text(part.get("partNumber")),
                clean_text(part.get("notes")),
                clean_text(part.get("source")),
                int(part.get("sortOrder") or 0),
                1 if part.get("active", True) else 0,
                stamp,
                stamp,
            ),
        )


def ensure_brand_archive_columns(db: sqlite3.Connection) -> None:
    columns = {row["name"] for row in db.execute("PRAGMA table_info(brands)").fetchall()}
    if "active" not in columns:
        db.execute("ALTER TABLE brands ADD COLUMN active INTEGER NOT NULL DEFAULT 1")
    if "archived_at" not in columns:
        db.execute("ALTER TABLE brands ADD COLUMN archived_at TEXT NOT NULL DEFAULT ''")
    if "deleted_at" not in columns:
        db.execute("ALTER TABLE brands ADD COLUMN deleted_at TEXT NOT NULL DEFAULT ''")
    if "deleted_name" not in columns:
        db.execute("ALTER TABLE brands ADD COLUMN deleted_name TEXT NOT NULL DEFAULT ''")


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def row_to_part(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "brandId": row["brand_id"],
        "brand": row["brand"],
        "accent": row["accent"],
        "logo": row["logo"],
        "family": row["family"],
        "model": row["model"],
        "category": row["category"],
        "item": row["item"],
        "buttonText": row["button_text"],
        "partNumber": row["part_number"],
        "notes": row["notes"],
        "source": row["source"],
        "sortOrder": row["sort_order"],
        "active": bool(row["active"]),
        "updatedAt": row["updated_at"],
    }


def get_or_create_brand(db: sqlite3.Connection, name: str) -> int:
    brand_name = clean_text(name)
    if not brand_name:
        raise ValueError("Brand is required.")

    row = db.execute("SELECT id, active, deleted_at FROM brands WHERE name = ?", (brand_name,)).fetchone()
    if row:
        if row["deleted_at"]:
            raise ValueError("That brand was permanently deleted from the app.")
        if not row["active"]:
            raise ValueError("That brand is saved. Restore it from Settings before adding parts to it.")
        return int(row["id"])

    sort_order = db.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM brands").fetchone()[0]
    db.execute(
        "INSERT INTO brands (name, accent, logo, sort_order) VALUES (?, ?, ?, ?)",
        (brand_name, "#2563eb", "", sort_order),
    )
    return int(db.execute("SELECT last_insert_rowid()").fetchone()[0])


def normalize_accent(value: object) -> str:
    accent = clean_text(value)
    if not accent:
        return "#2563eb"
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", accent):
        raise ValueError("Brand color must be a hex color like #2563eb.")
    return accent


def row_to_brand(row: sqlite3.Row) -> dict:
    keys = row.keys()
    return {
        "id": row["id"],
        "name": row["name"],
        "accent": row["accent"],
        "logo": row["logo"],
        "sortOrder": row["sort_order"],
        "active": bool(row["active"]) if "active" in keys else True,
        "archivedAt": row["archived_at"] if "archived_at" in keys else "",
        "deletedAt": row["deleted_at"] if "deleted_at" in keys else "",
        "deletedName": row["deleted_name"] if "deleted_name" in keys else "",
        "partCount": row["part_count"] or 0,
        "unassignedCount": row["unassigned_count"] or 0,
    }


class PartsHandler(BaseHTTPRequestHandler):
    server_version = "PPWorkWeb/1.0"
    department = DEFAULT_DEPARTMENT

    def db_connection(self) -> sqlite3.Connection:
        return connect(getattr(self, "department", DEFAULT_DEPARTMENT))

    def department_from_request(self, parsed) -> str:
        params = parse_qs(parsed.query)
        return normalize_department(first(params, "department") or self.headers.get("X-PPWork-Department"))


    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        self.department = self.department_from_request(parsed)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed)
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        self.department = self.department_from_request(parsed)
        restore_brand_id = self.restore_brand_id_from_path(parsed.path)
        if restore_brand_id is not None:
            self.restore_brand(restore_brand_id)
            return
        if parsed.path == "/api/parts":
            self.create_part()
            return
        if parsed.path == "/api/brands":
            self.create_brand()
            return
        if parsed.path == "/api/brands/reorder":
            self.reorder_brands()
            return
        if parsed.path == "/api/upload-logo":
            self.upload_logo()
            return
        if parsed.path == "/api/reseed":
            self.reseed()
            return
        self.send_error_json(HTTPStatus.NOT_FOUND, "Unknown endpoint.")

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        self.department = self.department_from_request(parsed)
        brand_id = self.brand_id_from_path(parsed.path)
        if brand_id is not None:
            self.update_brand(brand_id)
            return

        part_id = self.part_id_from_path(parsed.path)
        if part_id is None:
            self.send_error_json(HTTPStatus.NOT_FOUND, "Unknown endpoint.")
            return
        self.update_part(part_id)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        self.department = self.department_from_request(parsed)
        permanent_brand_id = self.permanent_brand_id_from_path(parsed.path)
        if permanent_brand_id is not None:
            self.permanently_delete_saved_brand(permanent_brand_id)
            return

        brand_id = self.brand_id_from_path(parsed.path)
        if brand_id is not None:
            self.delete_brand(brand_id)
            return

        part_id = self.part_id_from_path(parsed.path)
        if part_id is None:
            self.send_error_json(HTTPStatus.NOT_FOUND, "Unknown endpoint.")
            return
        self.delete_part(part_id)

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")

    def handle_api_get(self, parsed) -> None:
        if parsed.path == "/api/departments":
            self.get_departments()
            return
        if parsed.path == "/api/brands/saved":
            self.get_saved_brands()
            return
        if parsed.path == "/api/brands":
            self.get_brands()
            return
        if parsed.path == "/api/options":
            self.get_options(parsed)
            return
        if parsed.path == "/api/parts":
            self.get_parts(parsed)
            return
        if parsed.path == "/api/summary":
            self.get_summary()
            return
        self.send_error_json(HTTPStatus.NOT_FOUND, "Unknown endpoint.")

    def get_departments(self) -> None:
        self.send_json([
            {"id": key, "label": value["label"]}
            for key, value in DEPARTMENTS.items()
        ])

    def get_brands(self) -> None:
        with self.db_connection() as db:
            rows = db.execute(
                """
                SELECT b.id, b.name, b.accent, b.logo, b.sort_order, b.active,
                       b.archived_at, b.deleted_at, b.deleted_name,
                       COUNT(p.id) AS part_count,
                       SUM(CASE WHEN p.active = 1 AND p.part_number = '' THEN 1 ELSE 0 END) AS unassigned_count
                FROM brands b
                LEFT JOIN parts p ON p.brand_id = b.id AND p.active = 1
                WHERE b.active = 1 AND b.deleted_at = ''
                GROUP BY b.id
                ORDER BY b.name COLLATE NOCASE
                """
            ).fetchall()
        self.send_json(
            [row_to_brand(row) for row in rows]
        )

    def get_saved_brands(self) -> None:
        with self.db_connection() as db:
            rows = db.execute(
                """
                SELECT b.id, b.name, b.accent, b.logo, b.sort_order, b.active,
                       b.archived_at, b.deleted_at, b.deleted_name,
                       COUNT(p.id) AS part_count,
                       SUM(CASE WHEN p.active = 1 AND p.part_number = '' THEN 1 ELSE 0 END) AS unassigned_count
                FROM brands b
                LEFT JOIN parts p ON p.brand_id = b.id AND p.active = 1
                WHERE b.active = 0 AND b.deleted_at = ''
                GROUP BY b.id
                ORDER BY b.archived_at DESC, b.name COLLATE NOCASE
                """
            ).fetchall()
        self.send_json([row_to_brand(row) for row in rows])

    def create_brand(self) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            name = clean_text(payload.get("name"))
            if not name:
                raise ValueError("Brand name is required.")
            accent = normalize_accent(payload.get("accent"))
            logo = clean_text(payload.get("logo"))

            with self.db_connection() as db:
                existing = db.execute("SELECT active, deleted_at FROM brands WHERE name = ?", (name,)).fetchone()
                if existing:
                    if existing["deleted_at"]:
                        self.send_error_json(
                            HTTPStatus.CONFLICT,
                            "A permanently deleted backup record already uses that brand name.",
                        )
                    elif existing["active"]:
                        self.send_error_json(HTTPStatus.CONFLICT, "A brand with that name already exists.")
                    else:
                        self.send_error_json(
                            HTTPStatus.CONFLICT,
                            "A saved brand with that name already exists. Restore it from Saved Brands.",
                        )
                    return
                sort_order = db.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM brands").fetchone()[0]
                cursor = db.execute(
                    "INSERT INTO brands (name, accent, logo, sort_order) VALUES (?, ?, ?, ?)",
                    (name, accent, logo, sort_order),
                )
                brand_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            self.send_error_json(HTTPStatus.CONFLICT, "A brand with that name already exists.")
            return
        except ValueError as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"id": brand_id}, HTTPStatus.CREATED)

    def reorder_brands(self) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            brand_ids = payload.get("brandIds")
            if not isinstance(brand_ids, list) or not brand_ids:
                raise ValueError("Brand order is required.")
            ordered_ids = [int(brand_id) for brand_id in brand_ids]
            if len(ordered_ids) != len(set(ordered_ids)):
                raise ValueError("Brand order contains duplicate brands.")

            with self.db_connection() as db:
                existing_ids = {
                    int(row["id"])
                    for row in db.execute("SELECT id FROM brands WHERE active = 1 AND deleted_at = ''").fetchall()
                }
                if set(ordered_ids) != existing_ids:
                    raise ValueError("Brand order must include every active brand.")
                for index, brand_id in enumerate(ordered_ids, start=1):
                    db.execute(
                        "UPDATE brands SET sort_order = ? WHERE id = ?",
                        (index, brand_id),
                    )
        except (TypeError, ValueError) as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"ok": True})

    def upload_logo(self) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            data_url = clean_text(payload.get("dataUrl"))
            brand_name = clean_text(payload.get("brandName")) or "brand"
            match = re.fullmatch(r"data:(image/[a-zA-Z0-9.+-]+);base64,(.+)", data_url, re.S)
            if not match:
                raise ValueError("Logo upload must be a valid image file.")

            mime_type = match.group(1).lower()
            extension = LOGO_TYPES.get(mime_type)
            if not extension:
                raise ValueError("Logo must be PNG, JPG, WebP, or GIF.")

            image_bytes = base64.b64decode(match.group(2), validate=True)
            if not image_bytes:
                raise ValueError("Logo file is empty.")
            if len(image_bytes) > 4 * 1024 * 1024:
                raise ValueError("Logo file must be smaller than 4 MB.")

            slug = re.sub(r"[^a-z0-9]+", "-", brand_name.lower()).strip("-") or "brand"
            stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
            filename = f"{slug}-{stamp}{extension}"
            ASSETS_DIR.mkdir(parents=True, exist_ok=True)
            target = (ASSETS_DIR / filename).resolve()
            if not str(target).startswith(str(ASSETS_DIR.resolve())):
                raise ValueError("Invalid logo filename.")
            target.write_bytes(image_bytes)
        except (binascii.Error, ValueError) as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"path": f"assets/{filename}"}, HTTPStatus.CREATED)

    def update_brand(self, brand_id: int) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            name = clean_text(payload.get("name"))
            if not name:
                raise ValueError("Brand name is required.")
            accent = normalize_accent(payload.get("accent"))
            logo = clean_text(payload.get("logo"))

            with self.db_connection() as db:
                result = db.execute(
                    "UPDATE brands SET name = ?, accent = ?, logo = ? WHERE id = ?",
                    (name, accent, logo, brand_id),
                )
                if result.rowcount == 0:
                    self.send_error_json(HTTPStatus.NOT_FOUND, "Brand not found.")
                    return
        except sqlite3.IntegrityError:
            self.send_error_json(HTTPStatus.CONFLICT, "A brand with that name already exists.")
            return
        except ValueError as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"ok": True})

    def delete_brand(self, brand_id: int) -> None:
        with self.db_connection() as db:
            row = db.execute(
                """
                SELECT b.name, b.active, COUNT(p.id) AS part_count
                FROM brands b
                LEFT JOIN parts p ON p.brand_id = b.id
                WHERE b.id = ?
                GROUP BY b.id
                """,
                (brand_id,),
            ).fetchone()
            if not row:
                self.send_error_json(HTTPStatus.NOT_FOUND, "Brand not found.")
                return
            if not row["active"]:
                self.send_json({"ok": True})
                return
            db.execute(
                "UPDATE brands SET active = 0, archived_at = ? WHERE id = ?",
                (now_iso(), brand_id),
            )

        self.send_json({"ok": True})

    def restore_brand(self, brand_id: int) -> None:
        with self.db_connection() as db:
            row = db.execute(
                "SELECT id, active, deleted_at FROM brands WHERE id = ?",
                (brand_id,),
            ).fetchone()
            if not row:
                self.send_error_json(HTTPStatus.NOT_FOUND, "Saved brand not found.")
                return
            if row["deleted_at"]:
                self.send_error_json(HTTPStatus.CONFLICT, "That brand was permanently deleted from the app.")
                return
            if row["active"]:
                self.send_json({"ok": True})
                return

            sort_order = db.execute(
                "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM brands WHERE active = 1 AND deleted_at = ''"
            ).fetchone()[0]
            db.execute(
                """
                UPDATE brands
                SET active = 1, archived_at = '', sort_order = ?
                WHERE id = ?
                """,
                (sort_order, brand_id),
            )

        self.send_json({"ok": True})

    def permanently_delete_saved_brand(self, brand_id: int) -> None:
        payload = self.read_json()
        if payload is None:
            return
        if not valid_admin_password(payload.get("adminPassword")):
            self.send_error_json(HTTPStatus.FORBIDDEN, "Admin password is incorrect.")
            return

        with self.db_connection() as db:
            row = db.execute(
                """
                SELECT id, name, active, archived_at, deleted_at
                FROM brands
                WHERE id = ?
                """,
                (brand_id,),
            ).fetchone()
            if not row:
                self.send_error_json(HTTPStatus.NOT_FOUND, "Saved brand not found.")
                return
            if row["active"]:
                self.send_error_json(
                    HTTPStatus.CONFLICT,
                    "Save this brand before permanently deleting it.",
                )
                return
            if row["deleted_at"]:
                self.send_json({"ok": True})
                return

            stamp = now_iso()
            backup_name = row["name"]
            hidden_name = f"{backup_name} (deleted {brand_id})"
            db.execute(
                """
                UPDATE brands
                SET name = ?, active = 0,
                    archived_at = CASE WHEN archived_at = '' THEN ? ELSE archived_at END,
                    deleted_at = ?, deleted_name = ?
                WHERE id = ?
                """,
                (hidden_name, stamp, stamp, backup_name, brand_id),
            )

        self.send_json({"ok": True})

    def get_options(self, parsed) -> None:
        params = parse_qs(parsed.query)
        brand = first(params, "brand")

        with self.db_connection() as db:
            args = []
            where = ["p.active = 1", "b.active = 1", "b.deleted_at = ''"]
            if brand:
                where.append("b.name = ?")
                args.append(brand)
            where_sql = " AND ".join(where)

            def values(column: str) -> list[str]:
                rows = db.execute(
                    f"""
                    SELECT DISTINCT p.{column} AS value
                    FROM parts p
                    JOIN brands b ON b.id = p.brand_id
                    WHERE {where_sql} AND p.{column} != ''
                    ORDER BY p.{column}
                    """,
                    args,
                ).fetchall()
                return [row["value"] for row in rows]

            self.send_json(
                {
                    "families": values("family"),
                    "models": values("model"),
                    "categories": values("category"),
                }
            )

    def get_summary(self) -> None:
        with self.db_connection() as db:
            row = db.execute(
                """
                SELECT COUNT(*) AS total,
                       SUM(CASE WHEN p.active = 1 THEN 1 ELSE 0 END) AS active,
                       SUM(CASE WHEN p.active = 1 AND p.part_number = '' THEN 1 ELSE 0 END) AS unassigned
                FROM parts p
                JOIN brands b ON b.id = p.brand_id
                WHERE b.active = 1 AND b.deleted_at = ''
                """
            ).fetchone()
        self.send_json(
            {
                "total": row["total"] or 0,
                "active": row["active"] or 0,
                "unassigned": row["unassigned"] or 0,
            }
        )

    def get_parts(self, parsed) -> None:
        params = parse_qs(parsed.query)
        args = []
        where = ["p.active = 1", "b.active = 1", "b.deleted_at = ''"]

        for key, column in (
            ("brand", "b.name"),
            ("family", "p.family"),
            ("model", "p.model"),
            ("category", "p.category"),
        ):
            value = first(params, key)
            if value:
                where.append(f"{column} = ?")
                args.append(value)

        search = first(params, "q")
        if search:
            like = f"%{search}%"
            where.append(
                """
                (
                    p.item LIKE ? OR p.button_text LIKE ? OR p.part_number LIKE ? OR
                    p.model LIKE ? OR p.family LIKE ? OR p.category LIKE ? OR b.name LIKE ?
                )
                """
            )
            args.extend([like] * 7)

        with self.db_connection() as db:
            rows = db.execute(
                f"""
                SELECT p.*, b.name AS brand, b.accent, b.logo
                FROM parts p
                JOIN brands b ON b.id = p.brand_id
                WHERE {" AND ".join(where)}
                ORDER BY b.name COLLATE NOCASE, p.sort_order, p.family, p.model, p.category, p.item
                """,
                args,
            ).fetchall()
        self.send_json([row_to_part(row) for row in rows])

    def create_part(self) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            with self.db_connection() as db:
                brand_id = get_or_create_brand(db, clean_text(payload.get("brand")))
                stamp = now_iso()
                sort_order = db.execute(
                    "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM parts WHERE brand_id = ?",
                    (brand_id,),
                ).fetchone()[0]
                db.execute(
                    """
                    INSERT INTO parts (
                        brand_id, family, model, category, item, button_text, part_number,
                        notes, source, sort_order, active, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, 1, ?, ?)
                    """,
                    (
                        brand_id,
                        clean_text(payload.get("family")),
                        clean_text(payload.get("model")),
                        clean_text(payload.get("category")),
                        clean_text(payload.get("item")) or "Untitled Part",
                        clean_text(payload.get("buttonText")),
                        clean_text(payload.get("partNumber")),
                        clean_text(payload.get("notes")),
                        sort_order,
                        stamp,
                        stamp,
                    ),
                )
                part_id = int(db.execute("SELECT last_insert_rowid()").fetchone()[0])
        except ValueError as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"id": part_id}, HTTPStatus.CREATED)

    def update_part(self, part_id: int) -> None:
        payload = self.read_json()
        if payload is None:
            return

        try:
            with self.db_connection() as db:
                existing = db.execute("SELECT id FROM parts WHERE id = ?", (part_id,)).fetchone()
                if not existing:
                    self.send_error_json(HTTPStatus.NOT_FOUND, "Part not found.")
                    return

                brand_id = get_or_create_brand(db, clean_text(payload.get("brand")))
                db.execute(
                    """
                    UPDATE parts
                    SET brand_id = ?, family = ?, model = ?, category = ?, item = ?,
                        button_text = ?, part_number = ?, notes = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        brand_id,
                        clean_text(payload.get("family")),
                        clean_text(payload.get("model")),
                        clean_text(payload.get("category")),
                        clean_text(payload.get("item")) or "Untitled Part",
                        clean_text(payload.get("buttonText")),
                        clean_text(payload.get("partNumber")),
                        clean_text(payload.get("notes")),
                        now_iso(),
                        part_id,
                    ),
                )
        except ValueError as error:
            self.send_error_json(HTTPStatus.BAD_REQUEST, str(error))
            return

        self.send_json({"ok": True})

    def delete_part(self, part_id: int) -> None:
        with self.db_connection() as db:
            result = db.execute(
                "UPDATE parts SET active = 0, updated_at = ? WHERE id = ?",
                (now_iso(), part_id),
            )
            if result.rowcount == 0:
                self.send_error_json(HTTPStatus.NOT_FOUND, "Part not found.")
                return
        self.send_json({"ok": True})

    def reseed(self) -> None:
        with self.db_connection() as db:
            db.execute("DELETE FROM parts")
            db.execute("DELETE FROM brands")
            db.execute("DELETE FROM sqlite_sequence WHERE name IN ('parts', 'brands')")
            if self.department == DEFAULT_DEPARTMENT:
                seed_database(db)
        self.send_json({"ok": True})

    def read_json(self) -> dict | None:
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_JSON_BYTES:
            self.send_error_json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, "Request is too large.")
            return None
        try:
            raw = self.rfile.read(length).decode("utf-8")
            return json.loads(raw or "{}")
        except json.JSONDecodeError:
            self.send_error_json(HTTPStatus.BAD_REQUEST, "Invalid JSON.")
            return None

    def part_id_from_path(self, path: str) -> int | None:
        prefix = "/api/parts/"
        if not path.startswith(prefix):
            return None
        try:
            return int(path.removeprefix(prefix).strip("/"))
        except ValueError:
            return None

    def brand_id_from_path(self, path: str) -> int | None:
        prefix = "/api/brands/"
        if not path.startswith(prefix):
            return None
        try:
            return int(path.removeprefix(prefix).strip("/"))
        except ValueError:
            return None

    def restore_brand_id_from_path(self, path: str) -> int | None:
        match = re.fullmatch(r"/api/brands/(\d+)/restore/?", path)
        if not match:
            return None
        return int(match.group(1))

    def permanent_brand_id_from_path(self, path: str) -> int | None:
        match = re.fullmatch(r"/api/brands/(\d+)/permanent/?", path)
        if not match:
            return None
        return int(match.group(1))

    def serve_static(self, url_path: str) -> None:
        if url_path in {"", "/"}:
            relative = "index.html"
        else:
            relative = unquote(url_path.lstrip("/"))

        target = (STATIC_DIR / relative).resolve()
        if not str(target).startswith(str(STATIC_DIR.resolve())):
            self.send_error(HTTPStatus.FORBIDDEN)
            return

        if not target.exists() or not target.is_file():
            target = STATIC_DIR / "index.html"

        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_error_json(self, status: HTTPStatus, message: str) -> None:
        self.send_json({"error": message}, status)


def first(params: dict[str, list[str]], key: str) -> str:
    values = params.get(key, [])
    if not values:
        return ""
    return clean_text(values[0])


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the PPWork web parts board.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    args = parser.parse_args()

    init_db()
    server = ThreadingHTTPServer((args.host, args.port), PartsHandler)
    print(f"PPWork Web is running at http://{args.host}:{args.port}")
    for value in DEPARTMENTS.values():
        print(f"{value['label']} database: {value['db']}")
    server.serve_forever()


if __name__ == "__main__":
    main()
