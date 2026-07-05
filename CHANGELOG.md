# Changelog

All notable changes for the Independence County Offroad parts board are recorded here.

## 2026-07-05

### Added

- Added per-employee favorites. Each part card now has a star next to the part number.
- Added a dynamic Favorites brand button. It appears only when that employee has favorited at least one part and hides again when favorites are empty.
- Saved favorites per browser and department, so Parts and Service favorites stay separate for each employee.

### Changed

- Part cards now keep the original click-to-copy behavior while allowing the star to be clicked separately.
- Favorites are stored locally in the employee browser instead of changing the shared database.

### Verified

- Confirmed Favorites is hidden when empty.
- Confirmed starring a part turns the star yellow and adds the Favorites brand button.
- Confirmed clicking Favorites filters the board to favorited parts.
- Confirmed removing the last favorite hides Favorites again and returns the board to All.

## 2026-06-28

### Added

- Converted the original PPWork Visual Basic desktop app into a browser-based parts board.
- Added a local database-backed parts catalog using `parts.db`.
- Added a separate `service.db` database for the Service department.
- Added a Department panel in Settings with Parts and Service buttons.
- Added brand management in Settings, including adding, editing, renaming, deleting, restoring, and ordering brands.
- Added brand logo upload support. Uploaded logos are saved under `static/assets`.
- Added saved-brand recovery so deleted brands are hidden from the main board but can be restored later.
- Added permanent saved-brand removal from the app with admin password protection.
- Added light/dark theme support and extra theme variants for each browser instance.
- Added brand ordering options: A-Z, Z-A, most parts, least parts, and custom locked order.
- Added starter scripts for launching the app locally.

### Changed

- Renamed the application header and page title to Independence County Offroad.
- Added the footer text: Programmed by Matt Gaston.
- Moved the web app work folder to `C:\Users\mattg\OneDrive\Desktop\Codex\PPWorkWeb`.
- Kept the core PPWork workflow: click a part button to copy the part number for the cashier application.
- Kept the Parts department database as the main populated catalog and made Service start empty for department-specific setup.
- Made theme choices browser-specific so multiple employees can use their own theme preferences.
- Changed saved-brand permanent deletion from three confirmations to an admin password prompt.

### Data

- Added and reviewed the Can-Am section. The original Can-Am form had model choices but no saved part-number buttons, so Can-Am records start as editable placeholders until the dealership fills in current numbers.
- Preserved the populated Parts catalog with Bad Boy, Can-Am, Honda, and Polaris brands.

### Verified

- Confirmed the Parts department showed 300 active parts and 139 unassigned part numbers.
- Confirmed the Service department started with 0 parts and no brands.
- Confirmed department switching loaded separate databases.
- Confirmed wrong admin password was rejected for permanent saved-brand removal.
- Confirmed the configured admin password allowed permanent saved-brand removal from the app while leaving database backup rows available.
