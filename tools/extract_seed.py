import json
import re
from pathlib import Path


SOURCE_ROOT = Path(__file__).resolve().parents[2] / "PPWork" / "PPWork"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "seed-data.json"


BRANDS = {
    "Polaris": {"name": "Polaris", "accent": "#1d4ed8", "logo": "assets/polaris.png"},
    "Honda": {"name": "Honda", "accent": "#dc2626", "logo": "assets/honda.png"},
    "BadBoy": {"name": "Bad Boy", "accent": "#ea580c", "logo": "assets/badboy.webp"},
    "Canam": {"name": "Can-Am", "accent": "#111827", "logo": "assets/canam.png"},
}

CANAM_STARTER_PARTS = {
    "Defender": {
        "Roofs": ["2P Roof", "4P Roof"],
        "Windshields": ["Glass Windshield", "Poly Windshield", "Flip Windshield", "Half Windshield"],
        "Rear Panels": ["Glass Rear Panel", "Poly Rear Panel"],
        "Doors": ["Upper Doors", "Lower Doors", "Full Doors"],
        "Accessories": ["Heater", "Wiper", "Cab Light", "Rear View Mirror", "Side Mirrors"],
        "Winch + Mount": ["3500LB Winch", "4500LB Winch", "Winch Mount"],
        "Repair": ["Drive Belt", "Oil Change Kit", "Air Filter"],
    },
    "Maverick": {
        "Roofs": ["2P Roof", "4P Roof"],
        "Windshields": ["Full Windshield", "Half Windshield", "Flip Windshield"],
        "Rear Panels": ["Rear Wind Screen", "Poly Rear Panel"],
        "Doors": ["Lower Doors", "Aluminum Doors"],
        "Accessories": ["Side Mirrors", "Rear View Mirror", "Cargo Box", "Fender Extensions"],
        "Winch + Mount": ["4500LB Winch", "Winch Mount"],
        "Repair": ["Drive Belt", "Oil Change Kit", "Air Filter"],
    },
    "Trail": {
        "Roofs": ["Roof", "Sport Roof"],
        "Windshields": ["Full Windshield", "Half Windshield"],
        "Rear Panels": ["Rear Panel"],
        "Doors": ["Upper Doors"],
        "Accessories": ["Side Mirrors", "Rear View Mirror"],
        "Winch + Mount": ["3500LB Winch", "4500LB Winch", "Winch Mount"],
        "Repair": ["Drive Belt", "Oil Change Kit", "Air Filter"],
    },
    "Commander": {
        "Roofs": ["2P Roof", "4P Roof"],
        "Windshields": ["Glass Windshield", "Poly Windshield", "Flip Windshield", "Half Windshield"],
        "Rear Panels": ["Rear Panel"],
        "Doors": ["Soft Doors", "Full Doors"],
        "Accessories": ["Heater", "Wiper", "Rear View Mirror", "Side Mirrors"],
        "Winch + Mount": ["3500LB Winch", "4500LB Winch", "Winch Mount"],
        "Repair": ["Drive Belt", "Oil Change Kit", "Air Filter"],
    },
    "ATV": {
        "Protection": ["Front Bumper", "Rear Bumper", "Handguards"],
        "Racks": ["Front Rack", "Rear Rack"],
        "Accessories": ["Windshield", "Mirror Kit"],
        "Winch + Mount": ["2500LB Winch", "3500LB Winch", "Winch Mount", "Plow Mount"],
        "Repair": ["Drive Belt", "Oil Change Kit", "Air Filter", "Spark Plug"],
    },
}


def load_text(path):
    return path.read_text(encoding="utf-8", errors="ignore")


def designer_texts(name):
    path = SOURCE_ROOT / f"{name}.Designer.vb"
    if not path.exists():
        return {}

    text = load_text(path)
    matches = re.findall(r'Me\.(Button\d+|Backbutton)\.Text = "((?:""|[^"])*)"', text)
    return {button: value.replace('""', '"') for button, value in matches}


def region_spans(source):
    spans = []
    current = "General"
    start = 0

    for match in re.finditer(r'#Region\s+"([^"]+)"|#End Region', source):
        marker = match.group(0)
        if marker.startswith("#Region"):
            current = match.group(1).strip()
            start = match.end()
        else:
            spans.append((start, match.start(), current))
            current = "General"
            start = match.end()

    return spans


def region_for(position, spans):
    for start, end, name in spans:
        if start <= position <= end:
            return name
    return "General"


def split_region(brand, region):
    clean = region.replace(" Parts", "").replace(" parts", "").strip()

    if brand == "Polaris":
        if clean.startswith("RNG "):
            return "Ranger", clean.replace("RNG ", "", 1)
        if clean.startswith("RZR "):
            return "RZR", clean.replace("RZR ", "", 1)
        return "Other", clean

    if brand == "Honda":
        if clean.startswith("HONDA "):
            clean = clean.replace("HONDA ", "", 1)
        return "Pioneer", clean.title()

    if brand == "BadBoy":
        if clean in {"Blades", "Chutes", "Filters"}:
            return "Repair", clean
        return "Mowers", clean

    return "General", clean


def read_entries(source_name):
    brand = BRANDS[source_name]["name"]
    source = load_text(SOURCE_ROOT / f"{source_name}.vb")
    labels = designer_texts(source_name)
    spans = region_spans(source)
    entries = []

    block_pattern = re.compile(
        r"(?P<comment>\n\s*'\s*(?P<label>[^\n]+))?"
        r"\s*\n\s*Private Sub (?P<sub>\w+)_Click[^\n]*Handles\s+"
        r"(?P<button>Button\d+|Backbutton)\.Click(?P<body>.*?)(?:\n\s*End Sub)",
        re.S,
    )

    for order, match in enumerate(block_pattern.finditer(source), start=1):
        value = re.search(r'Clipboard\.SetText\("((?:""|[^"])*)"\)', match.group("body"))
        if not value:
            continue

        button = match.group("button")
        region = region_for(match.start(), spans)
        family, model = split_region(source_name, region)
        comment = (match.group("label") or "").strip()
        button_text = labels.get(button, "").strip()
        item = comment or button_text or button
        part_number = value.group(1).replace('""', '"').strip()

        entries.append(
            {
                "brand": brand,
                "family": family,
                "model": model,
                "category": region,
                "item": item,
                "buttonText": button_text,
                "partNumber": part_number,
                "notes": "",
                "source": f"{source_name}.vb:{button}",
                "sortOrder": order,
                "active": True,
            }
        )

    return entries


def read_canam_starter_entries():
    entries = []
    order = 1

    for model, categories in CANAM_STARTER_PARTS.items():
        family = "ATV" if model == "ATV" else "Side-by-Side"
        for category_name, items in categories.items():
            category = f"{model} {category_name}"
            for item in items:
                entries.append(
                    {
                        "brand": "Can-Am",
                        "family": family,
                        "model": model,
                        "category": category,
                        "item": item,
                        "buttonText": item,
                        "partNumber": "",
                        "notes": "Starter placeholder: enter the dealership's current part number.",
                        "source": f"Canam.starter:{model}:{category_name}:{item}",
                        "sortOrder": order,
                        "active": True,
                    }
                )
                order += 1

    return entries


def main():
    data = {
        "brands": list(BRANDS.values()),
        "parts": [],
    }

    for name in BRANDS:
        entries = read_entries(name)
        if name == "Canam" and not entries:
            entries = read_canam_starter_entries()
        data["parts"].extend(entries)

    OUTPUT_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(data['parts'])} parts to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
