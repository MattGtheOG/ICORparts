# CounterFlow Changelog

All notable changes for CounterFlow are recorded here.

## 2026-07-10 - Version 0.14.4

### Added

- Added an admin-only in-app update screen under Settings -> Admin Tools.
- Added a `Check Updates` action that downloads and stages the GitHub `main` branch while CounterFlow keeps running.
- Added an `Install Update` action that copies staged app files, creates an app backup, and clearly marks that a restart is required.
- Added local `updates/` preservation so staged packages are not included in publish or overwritten by app updates.

### Changed

- Updated the app version to `0.14.4`.

## 2026-07-10 - Version 0.14.3

### Added

- Added `Update-CounterFlowFromGitHub.bat` and `Update-CounterFlowFromGitHub.ps1` so CounterFlow can update itself from `MattGtheOG/ICORparts`.
- Added `Publish-CounterFlowToGitHub.bat` and `Publish-CounterFlowToGitHub.ps1` for clean source publishing from a signed-in Windows account.
- Added a root `.gitignore` for public source uploads that excludes live databases, backups, logs, caches, and generated website build folders.

### Changed

- Documented the GitHub update workflow in the README.
- Updated the app version to `0.14.3`.

## 2026-07-10 - Version 0.14.2

### Performance

- Brand buttons now highlight immediately instead of waiting for filter data to load.
- Brand filter options and part results now update in parallel when a database request is needed.
- Normal brand switches reuse the complete catalog already loaded by the main screen, avoiding repeat database requests.
- Added stale-request protection so rapid brand and filter changes cannot display an older response.
- Catalog data is invalidated and safely warmed again after edits, imports, restores, or department changes.

### Changed

- Updated the app version to `0.14.2`.

## 2026-07-10 - Version 0.14.1

### Added

- Added `Fresh-Install-CounterFlow.bat` for starting a fully blank installation.
- Added a typed `FRESH START` confirmation and automatic timestamped database backup before reset.
- Added shared data-folder support to the fresh-install reset tool.
- Added a persistent empty-install marker so a blank Parts database does not reload the starter catalog.

### Changed

- Updated the app version to `0.14.1`.

### Safety

- The reset refuses to run while CounterFlow is listening on the selected port.
- Only `parts.db`, `service.db`, and their SQLite sidecar files are removed; the backup, application files, brand images, logs, and seed file are preserved.

## 2026-07-10 - Version 0.14.0

### Added

- Added a generated CounterFlow logo combining a parts/service counter, gear, clock, and forward arrow.
- Added the new logo to the application header, browser icon, website header, website hero, and footer.
- Added `Start-CounterFlow.bat` and `Start-CounterFlow.ps1` launchers while retaining legacy launcher compatibility.

### Changed

- Renamed the application and showcase website from PPWork to CounterFlow.
- Kept the dealership name visible as the location identity beneath the CounterFlow product brand.
- Updated generated setup pages, demo downloads, startup messages, documentation, and product requirements with the new name.
- Preserved existing internal storage keys, API headers, environment variables, databases, and folder compatibility so the rebrand does not reset dealership data or employee preferences.
- Updated the app version to `0.14.0`.

### Verified

- Confirmed Python and JavaScript syntax checks pass.
- Confirmed the full application smoke test passes after the rebrand.
- Confirmed the application and website render without missing images, browser errors, or horizontal overflow on desktop and mobile.

## 2026-07-10 - Showcase Website

### Added

- Added a standalone responsive product website under `website`.
- Added dealership-focused workflow, benefit, feature, CRM/DMS positioning, security, backup, and deployment sections.
- Added an interactive real-world scenario selector for Parts, Sales, Service, and management workflows.
- Added a current product screenshot and existing dealership brand assets.

### Verified

- Confirmed desktop and mobile layouts have no horizontal overflow or missing images.
- Confirmed the mobile navigation and dealership scenario interactions run without browser errors.

## 2026-07-10 - Version 0.13.2

### Changed

- Limited the Dealership settings tab to signed-in admins, matching the Employees tab.
- Regular employees now open Settings on the Brands tab.
- Changed the top-bar Login button to Logout while an employee is signed in.
- Updated the app version to `0.13.2`.

### Verified

- Confirmed the JavaScript syntax check and full smoke test pass.

## 2026-07-10 - Version 0.13.1

### Added

- Added a dedicated `Login` button beside Settings with a separate Employee Login window.

### Changed

- Limited the Employees settings tab and employee management controls to signed-in admins.
- Changed the employee name in the top bar to a status label instead of a Settings shortcut.
- Non-admin users now open Settings on the Dealership tab.
- Updated the app version to `0.13.1`.

### Verified

- Confirmed Python and JavaScript syntax checks pass.
- Confirmed the full smoke test passes against the running local app.

## 2026-07-07 - Version 0.13.0

### Added

- Added first-run setup for creating the first live admin employee when no admin exists.
- Added a Role Permissions matrix in Employees settings.
- Added server-side role permission enforcement for import, export, brand editing, employee editing, and permanent saved-brand removal.

### Changed

- Updated the app version to `0.13.0`.
- Admin Tools can now appear for signed-in employees with assigned admin-tool permissions, not only full admin employees.
- Updated smoke tests for permission-protected brand actions.

### Verified

- Confirmed Python and JavaScript syntax checks pass.
- Confirmed smoke tests pass on the restarted `0.13.0` server.
- Confirmed setup status, role permission payload, role permission save, and blocked unauthenticated brand editing endpoints.
## 2026-07-07 - Version 0.12.0

### Added

- Added saved search presets in the main toolbar, including starter presets for oil filters, belts, and batteries.
- Added keyboard-first counter navigation for search, brand selection, part-card movement, and copy actions.
- Added per-employee copy formats for part-number-only, item, repair-order, DMS row, and CSV row workflows.
- Added automatic sign-out after 30 minutes of inactivity for shared counter computers.
- Added admin employee login reset controls for clearing a selected employee's password and PIN.
- Added Backup Health, Compact DB, and Deployment Checklist tools under Admin Tools.

### Changed

- Updated the app version to `0.12.0`.
- Kept the default copy behavior as part number only while allowing employees to choose richer formats.
- Updated the feature checklist and README for the new counter-speed and maintenance tools.

### Verified

- Confirmed the Python and JavaScript syntax checks pass with the bundled runtime.
## 2026-07-07 - Version 0.11.0

### Added

- Added tabbed Settings sections for Employees, Dealership, and Brands while keeping Department and Theme visible above the tabs.
- Added username/password employee login fields and employee department access settings.
- Added admin-only Admin Tools visibility for signed-in admin employees.
- Added demo-only `admin / Offroad` and `johnd / johnd` accounts to the downloadable demo databases.

### Changed

- Moved Brand Order and Lock Custom Order controls into the Brands tab below active and saved brands.
- Moved Admin Tools to the bottom of Settings while keeping them admin-only.
- Removed the Service Workflow panel from Settings for now.
- Kept the settings menu at the top when switching departments.
- Replaced the completed feature checklist with a new feature-idea list.
- Updated the app version to `0.11.0`.

### Verified

- Confirmed Python and JavaScript syntax checks pass.
- Confirmed employee username/password schema migrations are in place for existing databases.
## 2026-07-07 - Version 0.10.0

### Added

- Added cloud deployment files: `Dockerfile`, `Procfile`, `requirements.txt`, `.dockerignore`, and `cloud.env.example`.
- Added `PORT`, `PPWORK_PORT`, and `PPWORK_HOST` environment-variable support for hosted startup.
- Added `-NoBrowser` launcher mode for background startup.
- Added Windows Task Scheduler helper scripts for automatic startup after sign-in.
- Added `Update-PPWorkWeb.ps1` for previewing and applying app folder or ZIP updates while preserving local databases, backups, and logs.

### Changed

- Updated the app version to `0.10.0`.
- Updated README setup instructions for auto-start, updating, and cloud deployment.

### Verified

- Confirmed the Python and PowerShell files pass syntax checks.
- Confirmed the running app reports version `0.10.0`.
- Confirmed the launcher supports no-browser startup mode.
## 2026-07-06 - Version 0.9.0

### Added

- Added drag-and-drop brand ordering in Settings when Custom brand order is selected, while keeping the Up and Down buttons available.
- Added shared data-folder support with `PPWORK_DATA_DIR` and the launcher `-DataDir` option so databases, backups, and logs can live outside the app folder.
- Added a deployment info API showing the active app folder, data folder, database paths, backup folder, and log file.

### Changed

- Updated the app version to `0.9.0`.
- Updated setup instructions for four-person counter use and central data folders.

### Verified

- Confirmed the JavaScript and Python files pass syntax checks.
- Confirmed the running app reports version `0.9.0`.
- Confirmed deployment info reports the active data folder and database locations.
## 2026-07-06 - Version 0.8.0

### Added

- Added manager/admin session-token authorization for saving and hiding brands, permanent saved-brand removal, manual backups, backup restore, and bulk imports.
- Added schema migration tracking and a Migration History report in Admin Tools.
- Added JSON-line error logging under `logs/app.log` and an Error Log report in Admin Tools.
- Added friendlier failure handling for busy databases, write permission problems, failed imports, and missing uploaded assets.
- Added a downloadable demo database ZIP with starter Parts and Service examples for dealership onboarding.
- Added a Service Bay density mode for larger touch targets and tablet-friendly service counter use.
- Added an automated smoke-test script under `tools/smoke_tests.py`.

### Changed

- Updated the app version to `0.8.0`.
- Manual backup creation now requires either the admin password or a signed-in manager/admin account.
- CSV import now uses the same manager/admin authorization path as Excel import.
- Missing uploaded assets now return a clear `404 Asset not found` response instead of falling back to the app shell.

### Verified

- Confirmed the running app reports version `0.8.0`.
- Confirmed smoke tests pass for settings, department switching, manager login, manager backup authorization, account favorites, copy activity, brand save/restore/permanent removal, migration report, error log, and demo database download.
- Confirmed the demo database endpoint returns a valid ZIP file.
- Confirmed missing uploaded assets return a clear 404 response.
- Confirmed the browser UI shows the new Admin buttons and Service Bay density option without unexpected console errors.


## 2026-07-06 - Version 0.7.0

### Added

- Added optional employee accounts with PIN sign-in and counter, manager, or admin role labels.
- Added employee management in Settings, protected by the admin password.
- Added account-based favorites so signed-in employees can keep department-specific favorites in the database.
- Added Copy Activity logging and an Admin Tools report for signed-in employee copy events.
- Added automatic logo validation and resizing for uploaded brand logos, saved as optimized PNG files under `static/assets`.
- Added daily startup backups for both Parts and Service databases.
- Added printable Quick Reference and Network Setup pages from Admin Tools.

### Changed

- Updated the app version to `0.7.0`.
- Updated the setup checklist to include employee account setup and copy activity review.
- Kept existing guest browser favorites and quick-copy history for employees who are not signed in.

### Verified

- Confirmed the running app reports version `0.7.0`.
- Confirmed temporary employee creation, PIN sign-in, account favorites, copy activity logging, and cleanup.
- Confirmed a temporary oversized logo upload was resized to 512 pixels wide, saved as PNG, and cleaned up.
- Confirmed scheduled daily backups were created for Parts and Service.
- Confirmed Quick Reference and Network Setup pages respond successfully.

## 2026-07-06 - Version 0.6.0

### Added

- Added dealership, location, and department label settings.
- Added local and network app links in Settings for multi-counter access.
- Added a setup checklist for new dealership onboarding.
- Added review status and review note fields for parts.
- Added a Review Queue filter and Admin Tools report.
- Added Service workflow resources for labor templates, favorite kits, model-specific notes, and seasonal packages.

### Changed

- Updated the app version to `0.6.0`.
- Added Service workflow copy buttons so service notes and kits can be copied into a CRM or repair order system.

### Verified

- Confirmed Service workflow resources could be created, edited, copied, and deleted through the API.
- Confirmed temporary review-queue test data was cleaned from the Service database.
- Confirmed dealership settings, local link, setup checklist, and review report endpoints responded correctly.


## 2026-07-06 - Version 0.5.0

### Added

- Added powersports fitment fields to parts: year start, year end, make, fitment model, and unit type.
- Added a fitment filter row for year, make, unit model, and unit type.
- Added fitment details to part cards when those fields are present.
- Added fuzzy search so misspelled counter lookups can still find matching parts.
- Added the new fitment fields to CSV and Excel import/export columns.

### Changed

- Updated the app version to `0.5.0`.
- Updated the PRD to focus the product on powersports dealerships only for now.

### Verified

- Confirmed the running app reports version `0.5.0`.
- Confirmed a temporary Service part filtered correctly by year, make, fitment model, and unit type.
- Confirmed a misspelled search found the temporary fitment part.
- Confirmed the browser UI shows the fitment filter row, fitment card text, and fitment edit fields without console errors.

## 2026-07-05 - Version 0.4.0

### Added

- Added native Excel `.xlsx` export for the active department part catalog.
- Added native Excel `.xlsx` import using the same bulk-edit columns and backup protections as CSV import.
- Added an Export XLSX button and updated the import picker to accept both CSV and Excel files.

### Changed

- Updated the app version to `0.4.0`.
- Shared the import logic between CSV and Excel so create, update, skip, audit, and backup behavior stays consistent.

### Verified

- Confirmed Excel export opens as a workbook with the expected headers and 300 Parts rows.
- Confirmed Excel import created a temporary Service part, created an import backup, and was cleaned up with an admin-protected saved-brand removal backup.
- Confirmed Settings shows version `0.4.0`, Export CSV, Export XLSX, and the CSV/XLSX import picker without browser console errors.

## 2026-07-05 - Version 0.3.0

### Added

- Added advanced board filters for missing numbers, superseded parts, favorites, and recently updated parts.
- Added Recently Copied and Most Used panels that stay personal to each employee browser.
- Added keyboard shortcuts for search, edit mode, add part, and clearing filters.
- Added compact and comfortable density modes, also saved per employee browser.
- Added employee-specific pinned brands.
- Added brand categories and brand-level default family, model, and category fields.
- Added archive notes for saved brands and a restore preview before restoring a saved brand.
- Added a Settings link for release notes.
- Added backup filename reporting after admin-protected saved-brand permanent removal.

### Changed

- Updated the app version to `0.3.0`.
- Expanded the Settings brand editor with category, default fields, and archive note inputs.
- Improved the board layout so the new View filter and quick panels fit cleanly across desktop and mobile layouts.

### Verified

- Confirmed the running app reports version `0.3.0`.
- Confirmed the release notes, active brand, and saved brand endpoints load successfully.
- Confirmed a temporary Service brand saved category/default metadata, archived with an archive note, restored, and then cleaned up with the admin password.
- Confirmed the browser UI renders the new View filter, quick panels, keyboard shortcut, density control, brand metadata controls, pinned brand controls, and release notes without console errors.

## 2026-07-05

### Added

- Started implementing `FEATURE_TODO.md` high-priority features.
- Added app version `0.2.0` and displayed it in Settings.
- Added Admin Tools in Settings for manual database backup, backup restore, CSV export, CSV import, reports, and print-friendly lists.
- Added database backups under `backups/` plus automatic safety backups before imports, restores, brand hiding, and permanent saved-brand removal.
- Added CSV export/import for parts so bulk edits can be made from Excel-compatible CSV files.
- Added part audit history for create, update, delete, and CSV import actions.
- Added missing part number, duplicate part number, and recently changed part reports.
- Added print-friendly active part list by department.
- Added expanded part reference fields: old part number, new part number, alternate numbers, aftermarket numbers, vendor, tags, fitment notes, and attachment link.
- Expanded search to include old/new numbers, alternate numbers, aftermarket numbers, vendor, tags, fitment notes, attachment links, source, and notes.

### Verified

- Confirmed Parts still reports 300 active parts and 139 unassigned numbers.
- Confirmed backup creation, backup listing, CSV export, reports, print list, and admin-protected CSV import endpoints.
- Confirmed bad admin password blocks CSV import.
- Confirmed Service import test could create expanded fields and was cleaned back to an empty Service catalog.
- Confirmed Settings renders Admin Tools, version display, and expanded part fields without browser console errors.

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
