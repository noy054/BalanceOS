# BalanceOS Server — Claude Instructions

## Stack

NestJS, TypeScript, REST API, PostgreSQL, Prisma, JWT access tokens and refresh tokens.

## Product

BalanceOS supports people who track nutrition independently and consistently.

The promise: the same precision and control, with less effort.

Prioritize:

- Accurate calculations and reliable history.
- Fast logging, quantity changes and reusable meals.
- Manual nutrition targets and user control.
- Past, present and future day management.
- Consistent totals and useful reports.

Preserve existing EXPERT/GUIDED behavior.
Keep guidance optional and secondary.
Validate manual input without forcing calculated recommendations.

## Working Rules

- Briefly explain intended changes before editing.
- Make focused, safe changes and preserve unrelated work.
- Inspect client usage before changing API contracts.
- Reuse existing modules and helpers.
- Avoid `any`; justify unavoidable exceptions.
- Do not add code comments.
- Do not commit or push unless requested.
- Never expose secrets or edit `.env` files.

## Architecture

Follow the existing modular monolith.
Keep HTTP, business logic and database access separate.
Do not rename modules or create models merely to match examples.

Controllers:

- Handle HTTP, DTOs and authenticated request context.
- Delegate business behavior to services.
- Never call Prisma directly.

Services:

- Enforce domain rules and permissions.
- Coordinate repositories, calculations and transactions.
- Keep nutrition calculations centralized.

Repositories:

- Encapsulate Prisma queries and persistence.
- Accept explicit user scope where appropriate.
- Do not decide product behavior.

Use existing common guards, decorators, pipes and error handling.

## Types and Contracts

- Reuse existing Prisma enums and domain definitions.
- Preserve EXPERT/GUIDED and AUTO/MANUAL behavior.
- Use the existing MealType values; do not redefine them independently.
- Keep request and response contracts explicit.
- Update DTOs, mappers, client types and hooks together.
- Preserve older endpoints when existing app builds depend on them.
- Do not introduce architectural layers without a concrete need.

## Nutrition

- Centralize calculations in `nutrition-calculator`.
- Do not duplicate formulas across services.
- Support nutrition per 100 g and per serving.
- Support servings without a known gram weight.
- Require valid conversion data before converting units.
- Never guess a serving weight.
- Distinguish unknown nutrient values from zero.
- Preserve available source nutrients and provenance.
- Validate finite values and apply consistent precision.
- Avoid repeated rounding during intermediate calculations.
- Reject unsupported units and invalid calculation bases.
- Keep calculator previews and persisted results consistent.

## Historical Data

- Preserve daily target snapshots and meal-item nutrition snapshots.
- Source product edits must not rewrite logged nutrition.
- Target changes must not silently rewrite historical daily targets.
- Scale quantity edits from a stable stored nutrition basis.
- Avoid cumulative rounding drift across repeated edits.
- Preserve logged quantity, unit and serving description.
- Applying or copying a meal creates independent destination records.
- Snapshot values explicitly according to the operation.
- Do not replace historical values with current catalog data implicitly.

## Dates and Day Logs

- Treat a log date as a local calendar date.
- Validate actual dates, not only their string format.
- Avoid UTC conversions that shift the selected day.
- Use the requested date consistently for logging and totals.
- Support past and future entries.
- Do not create empty records for read-only visits.
- Enforce one day log per user and date.
- Keep statistics date boundaries consistent with Home.
- Preserve compatibility for older date endpoints when needed.

## Writes and Transactions

- Use transactions for related changes that must succeed together.
- Keep meal items, meal totals and day totals consistent.
- Cover adding, editing, removing, copying and applying saved meals.
- Avoid lost updates during concurrent requests.
- Add appropriate constraints and duplicate protection.
- Return enough updated data for immediate client refresh.
- Do not leave totals stale after successful mutations.
- Keep transactions short; avoid external API calls inside them.

## Pantry, Recipes and Saved Meals

- Enforce ownership of referenced private products and ingredients.
- Search all relevant records using server-side pagination.
- Make filtering explicit; avoid silently hiding searchable food.
- Preserve existing serving support across all flows.
- Make newly created products immediately usable.
- Keep reusable definitions separate from logged snapshots.
- Handle deleted or archived source records without corrupting history.

## Shared Catalog

- Keep private pantry edits separate from shared catalog changes.
- Queue manual products for review, including those without barcodes.
- Do not publish submissions automatically.
- Prevent duplicate pending submissions for the same private product.
- Preserve review outcomes; do not silently requeue rejected products.
- Support approval, rejection, merging, archiving and restoration.
- Preserve source attribution and original imported data.
- Catalog edits must not overwrite private copies or historical logs.
- Archive safely without breaking existing references.
- Write admin audit entries atomically with their changes.

## Progress and Photos

- Support dated weight and optional body measurements.
- Enforce ownership on entries and photo operations.
- Keep photos private; never expose public permanent URLs.
- Validate uploads and use existing storage abstractions.
- Clean up replaced or deleted files safely.
- Do not silently change profile weight or nutrition targets.
- Keep tracking history separate from nutrition calculations.

## Announcements and Admin

- Check the user's current database role on every admin request.
- Do not rely only on role claims inside existing tokens.
- Validate announcement lifecycle, schedule and audience rules.
- Persist seen/dismissed state per user.
- Validate action routes and external links.
- Distinguish in-app announcements from native push notifications.
- Never send real announcements as part of tests.
- Keep privileged actions auditable.

## Database

- Use Prisma schema and versioned migrations.
- Follow existing model names and relationships.
- Use relations for core data and JSON for snapshots or metadata.
- Add constraints and indexes for actual query patterns.
- Prioritize user/date queries, barcode lookup and review queues.
- Handle nullable nutrition and serving fields intentionally.
- Preserve existing data during backfills.
- Make backfills repeat-safe where applicable.
- Do not reset, drop or destructively rewrite databases without approval.
- Manual changes to existing user data require explicit authorization.
- An explicit request to modify identified data authorizes that scope.
- Routine app writes and authorized migrations need no repeated approval.

## Authentication and Ownership

- Hash passwords securely; never return password hashes.
- Never log passwords, tokens or credentials.
- Follow existing refresh-token rotation and revocation behavior.
- Derive user identity from authentication, never request body userId.
- Scope private reads and writes to the authenticated user.
- Check ownership of nested and referenced resources.
- Return consistent errors without leaking another user's records.
- Apply authorization to private files as well as database records.

## DTOs and Errors

- Validate required fields, enums, dates, quantities and units.
- Distinguish positive quantities from nutrients that may validly be zero.
- Handle omitted, null and zero values deliberately.
- Reject invalid combinations and unexpected fields.
- Validate pagination and query parameters.
- Use consistent HTTP errors and existing error codes.
- Keep user-facing error translation in the client.
- Do not expose database internals or sensitive details.

## Validation and Reporting

- Run relevant type-check, lint, formatting and unit checks.
- Test calculations with grams and gram-free servings.
- Test snapshots, quantity edits, totals and rounding.
- Test past/future dates, copying and empty days.
- Test authentication, cross-user access and admin restrictions.
- Test migrations against clean and representative existing databases.
- Use isolated test databases; never delete user data during tests.
- Distinguish unit, real-server and mocked checks.
- Never claim a check passed without running it.
- Report changes, checks, migration requirements and limitations concisely.
