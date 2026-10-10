# Admin frontend

The admin portal reads existing Supabase tables. No migration, new tables, database functions, triggers, or hosted configuration changes are required by this implementation.

## Run locally

Use the existing `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, then run `npm install` and `npm run dev`. Sign in with an existing admin account. Never put a service-role key in the frontend.

The interface checks the signed-in profile before rendering admin routes. Existing `admin` and `national_admin` roles use the national view. An existing `chapter_admin` needs `profiles.chapter_id` and uses that chapter's filters; its account directory only lists staff. Registration retains the existing donor, physician, and staff choices and excludes admin signup.

These checks and query filters control the interface. The existing Supabase row-level security policies must enforce actual authorization. This frontend does not add policies, provision administrator roles, disable accounts, or fix unsafe existing registration permissions. If existing policies deny reads, the page displays the error; if policies return no visible rows, it displays an empty result.

## Pages and existing data

- Audit logs: reads `audit_logs` with pagination, action/table/full user UUID/date/chapter filters, before/after details, and optional actor names from `profiles`. It displays existing activity only. It does not create audit logs or guarantee that every change was logged. IP and browser information display as not recorded when absent. Chapter attribution comes from before/after JSON; logs without chapter information cannot be attributed to a chapter view.
- Reports: reads `blood_units`, `requisitions`, `serological_tests`, and existing inventory transitions in `audit_logs`. PDF and CSV downloads are generated in the browser. Unreadable sources produce explicit warnings and unavailable sections.
- Supply monitoring: reads current inventory and displays counts by chapter, component, and blood group, including zero-stock combinations for chapter IDs found in accessible records. Expired units, missing/invalid expiry dates, and invalid ABO/Rh groups are excluded from usable supply. Fixed 5/15/50 viewing indicators are frontend labels, not clinical standards or shared inventory rules.
- Account directory: reads existing profile names, roles, chapters, and registration dates. There are no account editing or access-management controls.
- Transfers: reads existing requests and filters either participating chapter. No transfer mutations are implemented.
- Portal settings: national view of fixed supply labels and chapter identifiers derived from accessible tables. No configuration is saved to Supabase.

## Reporting limits

The detailed table definitions/screenshots use `blood_units.isbt_barcode`, chapter, ABO/Rh, and expiry fields. The README also describes a simpler `unit_id` inventory prototype. The frontend supports the detailed schema and falls back to the prototype's unit ID, component, status, and collection date if those detailed columns are missing. The fallback displays recorded inventory and monthly collections, with usable supply/current stock unavailable. Chapter inventory cannot be attributed when chapter fields are absent. If the requisitions table lacks chapter, component, quantity, or creation-date fields, monthly request totals are unavailable. The connected project's actual API schema determines which data can be displayed.

Monthly boundaries use Philippine time (UTC+8), with an inclusive start and exclusive next-day end. Collections count existing units whose recorded collection date falls in the period. Chapter attribution uses current inventory location because the existing schema does not establish historical collection locations.

Dispenses and discards count distinct unit/outcome pairs only when a dated inventory audit snapshot evidences a status transition. A currently dispensed unit's collection date is not treated as its dispense date. When no usable outcome history exists, these totals display **Unavailable**. Recorded counts may be incomplete even when some transitions exist.

Requests use `created_at`; requested units use `units_req`. Screening uses the latest dated test per unit within the period. Chapter screening uses units currently assigned to the chapter. Current stock uses today's available, unexpired units even when viewing a past month. Deleted units, historical chapter locations, and historical month-end balances cannot be reconstructed from incomplete existing records.

The browser reads aggregate datasets in batches and refuses summaries above 20,000 rows per source to avoid silently truncating totals. Select a chapter or a shorter reporting period where applicable; large inventory summaries require a future backend aggregation solution. Exports carry the data limitations and are internal summaries, not certified regulatory forms.

## Validation

```powershell
npm test
npm run test:browser
npm run lint
npm run build
```

Unit tests cover date boundaries, supply/report calculations, missing data, filters, and batching. Browser tests use isolated fixtures for existing REST tables and reject database writes or RPC calls. They exercise route checks, filters, exports, read-only pages, permission errors, and mobile layout. They do not change hosted accounts or prove hosted RLS security.

Browser tests use headless Microsoft Edge by default, or `PLAYWRIGHT_CHANNEL=chrome`. The test server uses port 5180. Screenshots and sample exports are written to ignored `test-results/`.
