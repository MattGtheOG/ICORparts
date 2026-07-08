# PPWork Web

This is a simple web replacement for the original PPWork WinForms app. It keeps the same core job: pick a brand/model/item, click the part, and the part number is copied for pasting into the cashier application.

## Run It

Open `Start-PPWorkWeb.bat` from this folder. It starts the local web server and opens:

```text
http://localhost:8765/
```

The app uses `parts.db` for the Parts department and `service.db` for the Service department. `parts.db` is created from `seed-data.json` when missing; `service.db` starts empty so Service can add only the brands and part records they need. By default, databases, backups, and logs live in this folder. Use the launcher `-DataDir` option to keep them in a shared folder instead.

## Editing Part Numbers

Turn on `Edit`, then select a part to change its part number, label, model, or category. Use `Add Part` for new items. Deleted parts are hidden from the board.

The original Can-Am form only had model choices and no saved part-number buttons, so the Can-Am board starts with editable placeholders. Fill those in from `Edit` as the dealership confirms each current part number.

## Counter Workflow

Use the toolbar preset menu for saved searches such as oil filters, belts, and batteries. Use `Save Search` to store the current search and filters for the active department.

The `Copy Format` selector controls what gets copied when a part is clicked. The default is part number only, and employees can also choose number plus item, brand/item/number, repair-order line, DMS row, or CSV row formats. The choice is saved per department and signed-in employee.

Keyboard shortcuts: `/` focuses search, arrow keys move through visible part cards, `Enter` or `Space` copies the focused part, and `Alt+B` moves focus to the brand list.

Signed-in employees are automatically signed out after 30 minutes of inactivity on shared counter computers.

## Settings Menu

Open `Settings` to choose the active department and theme from the top of the menu. The lower part of Settings uses tabs for `Employees`, `Dealership`, and `Brands`.

The `Employees` tab supports username/password sign-in, employee roles, location scope, Parts/Service department access, and a Role Permissions matrix. Admins can reset an employee login by clearing the selected employee's password and PIN. On a fresh live database, the app opens a first-run setup window to create the first admin employee. Admin Tools appear at the bottom of Settings for signed-in employees who have at least one admin-tool permission.

The `Dealership` tab controls the dealership name, location name, department labels, local network link, and setup checklist.

The `Brands` tab contains active brands, saved brands, and brand order controls. Brand order can be A-Z, Z-A, most parts, least parts, or a custom order that can be locked into the database. Deleting a brand asks twice, then saves and hides the brand with its parts so it can be restored later from `Saved Brands`. Saved brands can also be removed forever from the app after entering the admin password; their old database rows and part numbers stay available for admin backup.

Admin Tools include backup creation and restore, import/export, quality reports, backup health, database compact/repair, migration history, error logs, release notes, demo data download, and printable setup/network/deployment sheets. Import, export, brand editing, employee editing, and permanent saved-brand removal are checked against role permissions, with the admin password still available as an override.


## Demo Database

Signed-in admins can download the demo database ZIP from `Settings` -> `Admin Tools` -> `Demo Database`. The demo databases include sample login accounts for training only:

```text
admin / Offroad
johnd / johnd
```

Those demo accounts are created only inside the downloadable demo databases. They are not inserted into a normal live deployment.

## Moving To Another PC

Copy the full `PPWorkWeb` folder. That includes the database and brand images. The launcher can use the bundled Codex Python on this PC, or a normal Python 3 install on another PC.

## Network Use

For one shared counter computer, run the app normally. For other computers on the same network, run this on the host computer:

```powershell
.\Start-PPWorkWeb.ps1 -HostAddress 0.0.0.0 -Port 8765
```

Then open the host computer's local network address with port `8765`.

For a central data folder, create a shared folder on the host or server and start the app with `-DataDir`:

```powershell
.\Start-PPWorkWeb.ps1 -HostAddress 0.0.0.0 -Port 8765 -DataDir "\\SERVER\PPWorkData"
```

Every workstation that runs its own copy of the app should use the same `-DataDir` value so Parts, Service, backups, and logs stay together. For the simplest four-person counter setup, use one host computer and have the other employees open the host URL in their browser.
## Automatic Start On Windows

Use the startup task installer when this PC should start PPWork Web after the Windows user signs in:

```powershell
.\Install-PPWorkWebStartupTask.ps1 -HostAddress 0.0.0.0 -Port 8765 -DataDir "\\SERVER\PPWorkData" -RunNow
```

Leave off `-DataDir` if the databases should stay in this app folder. The task runs `Start-PPWorkWeb.ps1` with `-NoBrowser`, so it starts the server quietly instead of opening a browser window.

To remove the startup task later:

```powershell
.\Uninstall-PPWorkWebStartupTask.ps1
```

## Updating The App

Use the update helper when a newer PPWorkWeb folder or ZIP is ready to install:

```powershell
.\Update-PPWorkWeb.ps1 -PackagePath "C:\Path\To\PPWorkWeb.zip" -Preview
.\Update-PPWorkWeb.ps1 -PackagePath "C:\Path\To\PPWorkWeb.zip"
```

The updater saves an app backup under `backups`, copies the new app files, and preserves `parts.db`, `service.db`, `backups`, and `logs`. Restart PPWork Web after updating.

## Cloud Deployment

The app now includes basic cloud deployment files:

- `Dockerfile` for container hosting.
- `requirements.txt` for Python packages used by Excel and logo tools.
- `Procfile` for platforms that start apps with a `PORT` environment variable.
- `cloud.env.example` showing common environment settings.

For a local Docker test:

```powershell
docker build -t ppwork-web .
docker run -p 8765:8765 -v ppwork-data:/data ppwork-web
```

For hosted use, set `PPWORK_DATA_DIR` to a persistent storage path or mounted volume. Keep the app behind dealership-only access such as a private network, VPN, or protected hosting login before putting real dealership data in the cloud.
