# Product Requirements Document

## Product Name

Independence County Offroad Parts Board

## Status

Draft

## Last Updated

2026-07-05

## Product Summary

This application is a lightweight web-based parts board for dealerships that need a faster way to find, copy, and maintain OEM and aftermarket part numbers. It is intended for powersports, automotive, RV, and camper dealerships, especially parts and service departments that already use separate CRM, cashier, DMS, or repair order software.

The app does not replace the dealership CRM. It works beside it as a quick reference and copy tool so employees can search parts, click the correct part number, and paste it into the dealership's existing system.

## Problem

Dealership parts and service departments often keep part numbers in desktop tools, spreadsheets, paper notes, or employee memory. When OEM or aftermarket part numbers change, the tool or file must be manually updated, and outdated numbers can cause quoting errors, ordering delays, wrong parts, and inconsistent service write-ups.

Parts departments need speed at the counter. Service departments need accurate numbers while building repair orders. Managers need an easier way to update part numbers without changing code or rebuilding an application.

## Target Customers

- Powersports dealerships
- Automotive dealerships
- RV and camper dealerships
- Multi-brand dealerships
- Dealerships with separate Parts and Service departments
- Dealers that use CRM, cashier, DMS, repair order, or point-of-sale software but need a better part-number lookup board

## Primary Users

### Parts Counter Employee

Needs to quickly find a common part, copy the part number, and paste it into the cashier or CRM application.

### Service Advisor

Needs to find parts used on repair orders and service packages without asking Parts for every lookup.

### Parts Manager

Needs to add, edit, retire, restore, and organize brands and part numbers as OEM and aftermarket information changes.

### Dealership Admin or Owner

Needs a simple, reliable tool that can be shared across employees without replacing the current CRM or creating a complicated IT burden.

## Goals

- Make common part numbers fast to find and copy.
- Reduce wrong part numbers caused by outdated lists or hard-coded buttons.
- Let managers update brands and part numbers without editing code.
- Support Parts and Service departments with separate catalogs.
- Support multiple dealership types and brands.
- Keep each employee's personal preferences, theme, and favorites separate.
- Preserve deleted or retired data for backup and recovery.
- Stay simple enough for counter employees to use without training.

## Non-Goals

- Replace the dealership CRM, cashier system, DMS, inventory system, accounting system, or repair order platform.
- Process payments.
- Place live orders with OEM or aftermarket vendors in the first version.
- Manage full inventory quantities in the first version.
- Replace official OEM parts diagrams or fitment catalogs.

## Current Baseline

The current app includes:

- Local web app served from the dealership computer.
- SQLite database for Parts.
- Separate SQLite database for Service.
- Brand list with A-Z, Z-A, most parts, least parts, and custom locked ordering.
- Brand add, edit, delete, save, restore, and permanent app removal.
- Logo upload into `static/assets`.
- Light theme, dark theme, and theme variants.
- Per-browser theme preferences.
- Per-browser, per-department favorites.
- Click-to-copy part numbers.
- Editable part records.
- Saved-brand recovery.
- Admin password protection for permanent saved-brand removal.

## Key User Flows

### Copy A Part Number

1. Employee opens the parts board.
2. Employee selects a brand or searches by keyword.
3. Employee clicks a part card.
4. App copies the part number to the clipboard.
5. Employee pastes the number into the CRM, cashier, DMS, or repair order software.

### Add Or Update A Part Number

1. Manager turns on Edit mode.
2. Manager selects an existing part or adds a new one.
3. Manager updates brand, family, model, category, label, button text, part number, and notes.
4. App saves the change to the active department database.
5. Updated number is immediately available to employees.

### Manage Brands

1. Manager opens Settings.
2. Manager adds, edits, uploads logos for, reorders, saves, restores, or removes brands.
3. Main board updates based on active brands.

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
- Support search and filtering by brand, family, model, and category.
- Show active and unassigned part counts.
- Keep the board usable on desktop and tablet-sized screens.

### Part Management

- Add new parts.
- Edit existing parts.
- Hide deleted parts from the board.
- Store notes for internal reference.
- Support empty placeholder part numbers for numbers that need to be confirmed.

### Brand Management

- Add new brands.
- Edit brand name, color, logo path, and uploaded logo.
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

### Favorites

- Add a star next to each part number.
- Let employees favorite and unfavorite parts at any time.
- Highlight favorited stars yellow.
- Show a Favorites brand button only while favorites exist.
- Hide Favorites when no favorites exist.
- Store favorites per browser and department.

### Themes

- Support light and dark theme.
- Support multiple theme variants.
- Store theme choices per browser so employees can personalize their own instance.

## Future Requirements

### User Accounts

- Add optional employee login.
- Store favorites, theme, department, and display preferences by employee account instead of only browser storage.
- Add manager and admin roles.

### Import And Export

- Import parts from CSV or Excel.
- Export parts by brand or department.
- Export saved and permanently removed brand backup data.
- Provide downloadable backup files for the database.

### Part History

- Track who changed a part number and when.
- Show previous part numbers.
- Add rollback for accidental edits.

### Supersessions And Cross References

- Store old OEM numbers and new superseded numbers.
- Store aftermarket equivalents.
- Mark preferred part number by department.
- Warn when an employee copies an outdated number.

### CRM Copy Templates

- Let each dealership define copy formats for its CRM or cashier software.
- Support copying just the part number, part number plus description, or service package text.

### Service Packages

- Group multiple parts into a service kit.
- Copy all kit part numbers for common jobs.
- Support oil change, brake service, battery service, tire service, winterization, and RV/camper inspection packages.

### Fitment Helpers

- Add year, make, model, trim, engine, VIN, unit type, or RV appliance fields.
- Filter parts by fitment.
- Add notes for model-specific exceptions.

### Multi-Store And Cloud Sync

- Support multiple dealership locations.
- Sync shared catalogs across stores.
- Allow store-specific overrides.
- Add cloud-hosted option for easier multi-user access.

## Data Requirements

Core data should support:

- Departments
- Brands
- Parts
- Part numbers
- Part aliases
- OEM and aftermarket references
- Categories
- Models
- Families
- Notes
- Favorites
- Saved or archived brands
- Deleted or hidden records
- Audit history
- Users and roles if login is added

## Security And Permissions

- Protect admin-only actions with password or login roles.
- Restrict permanent removal, backups, imports, and bulk edits to managers or admins.
- Avoid exposing admin passwords in plain text.
- Add automatic backup before destructive actions.
- Add clear warnings before hiding or removing brands.

## Reliability Requirements

- App should keep working if internet is unavailable when used locally.
- Database should be easy to back up.
- App should not lose part data when brands are hidden.
- App should recover gracefully from empty departments or empty brands.
- App should be fast enough for counter use, ideally under one second for search/filter updates on common catalog sizes.

## Success Metrics

- Time to find and copy a common part number.
- Reduction in wrong part numbers entered into CRM or cashier software.
- Number of parts updated without developer help.
- Number of active employee favorites.
- Number of Service department lookups handled without calling Parts.
- Manager satisfaction with ease of updating brands and parts.

## Open Questions

- Should dealerships log in with employee accounts, or is per-browser personalization enough for now?
- Should Parts and Service share some brands while keeping separate part-number lists?
- Which CRM, DMS, cashier, and repair order systems should be prioritized for copy templates or integrations?
- Should the app become cloud-hosted for multi-computer dealership use?
- Should part-number updates require manager approval before going live?
- Should dealerships be able to attach images, PDFs, vendor invoices, or OEM diagram links to parts?

## Recommended Release Plan

### Phase 1: Local Department Tool

- Continue improving the current local app.
- Polish part editing, brand settings, favorites, and department switching.
- Add backup/export tooling.

### Phase 2: Manager Controls

- Add user roles or admin login.
- Add import/export.
- Add audit history.
- Add part supersession tracking.

### Phase 3: Dealership Workflow Features

- Add service packages and kits.
- Add CRM copy templates.
- Add fitment helpers.
- Add reports for missing part numbers and recently changed records.

### Phase 4: Multi-User Or Cloud Version

- Add central database support.
- Add employee accounts.
- Add dealership/location settings.
- Add secure remote access for multiple computers.
