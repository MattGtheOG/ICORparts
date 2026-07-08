# Product Requirements Document

## Product Name

Independence County Offroad Parts Board

## Status

Draft - Powersports Focus

## Last Updated

2026-07-06

## Product Summary

This application is a lightweight web-based parts and service reference board for powersports dealerships. It helps parts counters and service departments quickly find, copy, and maintain OEM and aftermarket part numbers for ATVs, UTVs, side-by-sides, motorcycles, dirt bikes, scooters, and personal watercraft.

The app does not replace the dealership CRM, cashier system, DMS, or repair order software. It works beside those systems as a fast lookup and clipboard tool: employees search or filter for the right part, click the card, and paste the part number into the dealership's existing workflow.

## Current Industry Scope

For now, the product is focused on powersports dealerships only.

Included powersports use cases:

- ATV and UTV common parts lookup.
- Motorcycle and dirt bike maintenance part lookup.
- Side-by-side service package support.
- OEM and aftermarket number cross-reference.
- Year, make, unit model, and unit type fitment filtering.
- Parts and Service department catalogs for a dealership counter environment.

Out of current scope:

- Automotive dealership-specific workflows.
- RV or camper dealership-specific workflows.
- Full inventory management.
- Live OEM catalog replacement.
- Payment, invoicing, or repair order ownership.

## Problem

Powersports dealerships often maintain common part numbers in old desktop utilities, spreadsheets, binders, sticky notes, or employee memory. OEM numbers can supersede, aftermarket alternatives change, and fitment details vary by year and model. When the lookup source is hard-coded or difficult to update, counter employees can copy outdated numbers, quote the wrong part, delay service work, or interrupt another employee for confirmation.

Parts and service teams need a simple, shared tool that makes common numbers fast to find while letting managers update data without changing code.

## Target Customers

- Independent powersports dealerships.
- Multi-line powersports dealerships.
- Offroad, ATV, UTV, side-by-side, motorcycle, dirt bike, scooter, and personal watercraft dealers.
- Dealerships with separate Parts and Service departments.
- Dealers that already use CRM, cashier, DMS, repair order, or point-of-sale software but need a faster common-parts lookup board.

## Primary Users

### Parts Counter Employee

Needs to quickly find a common part, copy the part number, and paste it into the cashier, CRM, DMS, or point-of-sale application.

### Service Advisor

Needs to find common parts and service notes while building repair orders without waiting on Parts for every lookup.

### Parts Manager

Needs to add, edit, retire, restore, import, export, and organize brands, part numbers, fitment fields, and reference data as OEM and aftermarket information changes.

### Dealership Admin Or Owner

Needs a simple local tool that can be shared by several employees, protected from accidental destructive changes, and backed up without a large IT burden.

## Goals

- Make common powersports part numbers fast to find and copy.
- Reduce wrong numbers caused by outdated hard-coded buttons or scattered spreadsheets.
- Let managers update brands, fitment data, and part numbers without developer help.
- Support separate Parts and Service department catalogs.
- Support OEM and aftermarket part-number references.
- Support fitment lookup by year, make, unit model, and unit type.
- Preserve deleted or retired brand and part data for backup and recovery.
- Keep each employee's local preferences, theme, favorites, and quick-copy history separate.
- Stay simple enough for counter employees to use with little training.

## Non-Goals

- Replace the dealership CRM, cashier system, DMS, inventory system, accounting system, or repair order platform.
- Process payments.
- Place live orders with OEM or aftermarket vendors in the first version.
- Manage full inventory quantities.
- Replace official OEM parts diagrams or fitment catalogs.
- Serve automotive or RV/camper dealership workflows during the current product focus.

## Current Baseline

The current app includes:

- Local web app served from the dealership computer.
- SQLite database for Parts.
- Separate SQLite database for Service.
- Brand list with A-Z, Z-A, most parts, least parts, and custom locked ordering.
- Brand add, edit, delete, save, restore, and permanent app removal.
- Logo upload into `static/assets` with automatic image validation, resizing, and optimized PNG output.
- Brand categories and brand-level default family, model, and category fields.
- Saved-brand archive notes and restore previews.
- Light theme, dark theme, theme variants, and compact/comfortable density modes.
- Per-browser theme and density preferences.
- Optional employee accounts with PIN sign-in, session tokens, and counter, manager, or admin role labels.
- Per-browser, per-department favorites and pinned brands for guest use.
- Account-based favorites when an employee is signed in.
- Click-to-copy part numbers.
- Copy Activity reporting for signed-in employee copy events.
- Recently Copied and Most Used quick panels.
- Editable part records.
- Old number, new number, alternate number, aftermarket number, vendor, tag, fitment note, attachment link, and notes fields.
- Year start, year end, make, fitment model, and unit type fields.
- Fitment filtering by year, make, unit model, and unit type.
- Search across common reference fields with fuzzy matching for misspellings.
- CSV and native Excel import/export.
- Database backup and restore from Settings.
- Automatic daily startup backups for Parts and Service.
- Automatic safety backups before import, restore, brand hiding, and permanent saved-brand removal.
- Audit history for part create, update, delete, and import actions.
- Missing part number, duplicate part number, recently changed, review queue, and copy activity reports.
- Review status and review notes for parts that need manager confirmation.
- Service workflow resources for labor templates, favorite kits, model notes, and seasonal packages.
- Print-friendly active part list.
- Printable quick-reference sheet, setup checklist, network setup page, and local/network app links.
- Dealership, location, and department label settings.
- Schema migration tracking with an Admin Tools migration history report.
- Error logging under `logs/app.log` with an Admin Tools error log report.
- Friendly error messages for busy databases, failed imports, and missing uploaded assets.
- Downloadable demo database ZIP for new dealership setup and training.
- Automated smoke tests for core workflows under `tools/smoke_tests.py`.
- Service Bay density mode for larger touch targets on tablets and service counters.
- Admin password or signed-in manager/admin authorization for brand hiding, imports, restores, manual backups, and permanent saved-brand removal.
- Admin password protection for employee management.

## Key User Flows

### Copy A Part Number

1. Employee opens the parts board.
2. Employee selects a brand, searches by keyword, or filters by fitment.
3. Employee clicks the matching part card.
4. App copies the part number to the clipboard.
5. Employee pastes the number into the CRM, cashier, DMS, or repair order software.

### Find A Part By Powersports Fitment

1. Employee enters the customer's unit year.
2. Employee chooses make, unit model, and unit type when available.
3. App filters to matching parts whose year range includes the selected year.
4. Employee copies the part number or opens the part in Edit mode.

### Add Or Update A Part Number

1. Manager turns on Edit mode.
2. Manager selects an existing part or adds a new one.
3. Manager updates brand, family, model, category, fitment fields, label, button text, part number, references, and notes.
4. App saves the change to the active department database.
5. Updated data is immediately available to employees.

### Bulk Update With Excel

1. Manager exports the current department catalog as `.xlsx`.
2. Manager edits part numbers, fitment fields, categories, vendors, notes, or references in Excel.
3. Manager imports the edited file with the admin password.
4. App creates a database backup first, then creates or updates matching rows.
5. App records audit entries for imported creates and updates.

### Manage Brands

1. Manager opens Settings.
2. Manager adds, edits, uploads logos for, reorders, saves, restores, or removes brands.
3. Main board updates based on active brands.
4. Saved brands remain recoverable unless permanently removed from the normal app view with the admin password.

### Use Favorites

1. Employee clicks the star next to a commonly used part.
2. App highlights the star yellow.
3. App shows a Favorites brand button.
4. Employee clicks Favorites to view only their saved parts.
5. Favorites remain specific to that employee's browser and department.

### Switch Departments

1. Employee opens Settings.
2. Employee chooses Parts or Service.
3. App loads the matching department database.
4. Parts and Service can keep different brand and part lists.

## Functional Requirements

### Parts Board

- Display brands in a left-side brand list.
- Display parts as clickable cards.
- Copy part numbers to the clipboard when a part card is clicked outside Edit mode.
- Warn the employee when a part does not have a number yet.
- Support search and filtering by brand, family, model, category, view, year, make, fitment model, and unit type.
- Support fuzzy matching for common misspellings.
- Show fitment text on part cards when fitment fields are populated.
- Show active and unassigned part counts.
- Keep the board usable on desktop and tablet-sized screens.

### Part Management

- Add new parts.
- Edit existing parts.
- Hide deleted parts from the board.
- Store notes for internal reference.
- Store OEM and aftermarket reference numbers.
- Store powersports fitment details.
- Support empty placeholder part numbers for numbers that need to be confirmed.

### Brand Management

- Add new brands.
- Edit brand name, color, category, logo path, defaults, and uploaded logo.
- Save and hide brands without losing their part records.
- Restore saved brands.
- Permanently remove saved brands from the normal app view after admin password entry.
- Keep old database rows available for emergency admin backup.
- Sort brands A-Z, Z-A, by most parts, by least parts, or by custom order.

### Departments

- Support a Parts department catalog.
- Support a Service department catalog.
- Keep department databases separate.
- Remember the selected department per browser.

### Favorites And Personalization

- Add a star next to each part number.
- Let employees favorite and unfavorite parts at any time.
- Highlight favorited stars yellow.
- Show a Favorites brand button only while favorites exist.
- Store guest favorites, pinned brands, theme, density, and copy activity per browser and department.
- Store signed-in employee favorites in the database by department.

### Themes

- Support light and dark theme.
- Support multiple theme variants.
- Support compact and comfortable density modes.
- Store visual choices per browser so employees can personalize their own workstation.

## Future Requirements

### User Accounts

- Store theme, density, department, pinned brands, and display preferences by employee account instead of only browser storage.
- Track changed-by activity for edits and imports.

### Review Queue

- Let managers approve or dismiss pending part changes in a dedicated workflow instead of only filtering/reporting parts marked Needs Review.
- Add notifications or dashboard counts for parts awaiting confirmation.

### Service Department Tools

- Add reusable service package copy formats for common powersports use cases such as oil changes, belt service, brake service, battery service, tire service, pre-season inspection, winterization, and post-ride inspection.
- Connect Service workflow resources directly to part kits and copy templates.

### Supersessions And Cross References

- Store old OEM numbers and new superseded numbers.
- Store aftermarket equivalents.
- Mark preferred part number by department.
- Warn when an employee copies an outdated number.

### CRM Copy Templates

- Let each dealership define copy formats for its CRM, cashier, DMS, or repair order software.
- Support copying just the part number, part number plus description, or service package text.

### Fitment Helpers

- Expand fitment fields to include trim, engine, displacement, VIN prefix, drivetrain, transmission, and notes for model-specific exceptions.
- Add reusable fitment groups for common powersports platforms.
- Add reports for parts with missing fitment data.

### Multi-User And Deployment

- Support a central shared data folder for multiple counter computers when a dealership wants databases, backups, and logs outside the app folder.
- Add Windows service mode so the app starts automatically.
- Add central settings for backup retention and network deployment checks.
- Consider a cloud-hosted option after the local powersports workflow is stable.

## Data Requirements

Core data should support:

- Departments
- Brands
- Parts
- Part numbers
- OEM references
- Aftermarket references
- Alternate numbers
- Superseded numbers
- Families
- Categories
- Catalog models
- Fitment year start and end
- Fitment make
- Fitment model
- Unit type
- Vendors
- Tags
- Fitment notes
- Attachments or reference links
- Notes
- Favorites
- Pinned brands
- Copy activity
- Saved or archived brands
- Deleted or hidden records
- Audit history
- Employee users and role labels

## Security And Permissions

- Protect admin-only actions with password or signed-in manager/admin session tokens.
- Restrict brand hiding, permanent removal, manual backups, imports, restores, and bulk edits to admin password users or signed-in managers/admins.
- Avoid exposing admin passwords in plain text.
- Add automatic backup before destructive actions.
- Add clear warnings before hiding or removing brands.
- Preserve backup files for recovery from accidental imports or removals.

## Reliability Requirements

- App should keep working if internet is unavailable when used locally.
- Database should be easy to back up.
- App should not lose part data when brands are hidden.
- App should recover gracefully from empty departments or empty brands.
- App should be fast enough for counter use, ideally under one second for search/filter updates on common powersports catalog sizes.

## Success Metrics

- Time to find and copy a common powersports part number.
- Reduction in wrong part numbers entered into CRM, cashier, DMS, or repair order software.
- Number of parts updated without developer help.
- Number of active employee favorites.
- Number of Service department lookups handled without calling Parts.
- Percentage of common parts with fitment fields populated.
- Manager satisfaction with ease of updating brands, parts, and fitment data.

## Open Questions

- Should Parts and Service share some powersports brands while keeping separate part-number lists?
- Which powersports CRM, DMS, cashier, and repair order systems should be prioritized for copy templates?
- Should part-number updates require manager approval before going live?
- Which fitment fields matter most for Independence County Offroad: trim, engine, displacement, VIN prefix, or drivetrain?
- Should the app become cloud-hosted after the local counter workflow is stable?

## Recommended Release Plan

### Phase 1: Local Powersports Counter Tool

- Continue improving the current local app.
- Polish part editing, brand settings, favorites, fitment filtering, and department switching.
- Keep backup/export tooling strong.

### Phase 2: Manager Controls

- Enforce manager and admin permissions for sensitive actions.
- Add changed-by tracking for edits and imports.
- Add automated browser regression tests in addition to smoke tests.
- Improve audit history and rollback tools.

### Phase 3: Powersports Service Workflow

- Connect service kits to package copying.
- Expand labor note templates with CRM/DMS copy formats.
- Add richer model-specific service notes.

### Phase 4: Multi-User Deployment

- Harden central shared data-folder deployments.
- Add backup retention settings.
- Add Windows service mode.
- Add cloud-hosted deployment research after local shared-folder use is stable.
