# PPWork Web

This is a simple web replacement for the original PPWork WinForms app. It keeps the same core job: pick a brand/model/item, click the part, and the part number is copied for pasting into the cashier application.

## Run It

Open `Start-PPWorkWeb.bat` from this folder. It starts the local web server and opens:

```text
http://localhost:8765/
```

The app uses `parts.db` for the Parts department and `service.db` for the Service department. `parts.db` is created from `seed-data.json` when missing; `service.db` starts empty so Service can add only the brands and part records they need.

## Editing Part Numbers

Turn on `Edit`, then select a part to change its part number, label, model, or category. Use `Add Part` for new items. Deleted parts are hidden from the board.

The original Can-Am form only had model choices and no saved part-number buttons, so the Can-Am board starts with editable placeholders. Fill those in from `Edit` as the dealership confirms each current part number.

## Brands And Theme

Open `Settings` to choose the active department, add or rename brands, update a brand color, upload a logo into `static/assets`, set an optional logo path, switch between light and dark theme, or choose the brand order. Brand order can be A-Z, Z-A, most parts, least parts, or a custom order that can be locked into the database. Deleting a brand asks twice, then saves and hides the brand with its parts so it can be restored later from `Saved Brands`. Saved brands can also be removed forever from the app after entering the admin password; their old database rows and part numbers stay available for admin backup.

## Moving To Another PC

Copy the full `PPWorkWeb` folder. That includes the database and brand images. The launcher can use the bundled Codex Python on this PC, or a normal Python 3 install on another PC.

## Network Use

For one shared counter computer, run the app normally. For other computers on the same network, run:

```powershell
.\Start-PPWorkWeb.ps1 -HostAddress 0.0.0.0 -Port 8765
```

Then open the host computer's local network address with port `8765`.
