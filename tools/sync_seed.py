import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]
DB_PATH = APP_DIR / "parts.db"
SEED_PATH = APP_DIR / "seed-data.json"


def clean(value):
    if value is None:
        return ""
    return str(value).strip()


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def get_or_create_brand(db, brand):
    name = clean(brand["name"])
    row = db.execute("SELECT id FROM brands WHERE name = ?", (name,)).fetchone()
    if row:
        db.execute(
            "UPDATE brands SET accent = ?, logo = ? WHERE id = ?",
            (clean(brand.get("accent")) or "#2563eb", clean(brand.get("logo")), row[0]),
        )
        return row[0]

    sort_order = db.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM brands").fetchone()[0]
    cursor = db.execute(
        "INSERT INTO brands (name, accent, logo, sort_order) VALUES (?, ?, ?, ?)",
        (name, clean(brand.get("accent")) or "#2563eb", clean(brand.get("logo")), sort_order),
    )
    return cursor.lastrowid


def main():
    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    inserted = 0
    updated_brands = 0
    stamp = now_iso()

    with sqlite3.connect(DB_PATH) as db:
        db.execute("PRAGMA foreign_keys = ON")
        brands = {}
        for brand in data.get("brands", []):
            brands[clean(brand["name"])] = get_or_create_brand(db, brand)
            updated_brands += 1

        for part in data.get("parts", []):
            source = clean(part.get("source"))
            if not source:
                continue

            existing = db.execute("SELECT id FROM parts WHERE source = ?", (source,)).fetchone()
            if existing:
                continue

            brand_id = brands.get(clean(part.get("brand")))
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
                    clean(part.get("family")),
                    clean(part.get("model")),
                    clean(part.get("category")),
                    clean(part.get("item")) or "Untitled Part",
                    clean(part.get("buttonText")),
                    clean(part.get("partNumber")),
                    clean(part.get("notes")),
                    source,
                    int(part.get("sortOrder") or 0),
                    1 if part.get("active", True) else 0,
                    stamp,
                    stamp,
                ),
            )
            inserted += 1

    print(f"Synced {updated_brands} brands and inserted {inserted} missing parts.")


if __name__ == "__main__":
    main()
