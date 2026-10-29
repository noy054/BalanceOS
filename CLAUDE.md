# BalanceOS — Claude Instructions

## Product

BalanceOS is a smart nutrition calculator and management platform for people who already track calories and macros independently and consistently.

The promise: the same precision and control, with less effort.

Users repeat familiar meals, products and recipes, adjusting quantities over time. Prioritize:

- Fast logging and calculations.
- Reusing saved meals, recipes and previous work.
- Quick quantity adjustments.
- Accurate numbers, manual control and useful reports.
- Minimal taps, typing, navigation and mental effort.

The initial audience is experienced trainees, but the product must work regardless of training or body goals.

Keep existing EXPERT/GUIDED behavior. Guidance is optional and secondary.
Do not build separate apps or add unsolicited coaching.

## Core Principles

- Make daily actions simple, readable and efficient.
- Respect users’ knowledge and independence.
- Present facts without shame or judgment.
- Never assume the goal is weight loss.
- Preserve existing functionality, user data and historical nutrition.
- Use references for inspiration, not exact copies.

## Tech Stack

Client:

- Expo, React Native, TypeScript and Expo Router.
- TanStack Query, Zustand and Axios.
- React Native Paper.
- Expo SecureStore for tokens.

Server:

- NestJS, TypeScript and REST API.
- PostgreSQL and Prisma.
- JWT and refresh tokens.

Follow the existing modular backend and feature-based frontend.
Do not introduce architectural layers or dependencies without a concrete need.

## Working Rules

- Briefly explain the intended change before editing.
- Inspect both client and server when a task affects both.
- Make focused changes and preserve unrelated work.
- Reuse existing implementations before creating new ones.
- Avoid `any`; justify unavoidable exceptions.
- Do not add code comments.
- Do not commit or push unless requested.
- Never expose secrets or edit `.env` files.

## Frontend Architecture

- Keep screens thin: compose components, call hooks and navigate.
- Keep complex business logic and calculations outside screens.
- Access Axios only through the typed API layer.
- Keep feature API contracts and types together.
- Use existing `api`, `hooks`, `types`, `components`, `helpers` and constants patterns.
- Create folders only when needed; do not reorganize unrelated features.
- Use TanStack Query for server state.
- Use Zustand for local UI state and temporary drafts.
- Do not duplicate server data in Zustand.
- Update client contracts when backend responses change.

## Backend Architecture

- Controllers handle HTTP concerns.
- Services contain business logic.
- Repositories handle database access.
- Do not call Prisma directly from controllers.
- Validate DTOs, dates, quantities and supported units.
- Enforce authentication, ownership and admin permissions on the server.
- Use transactions for related writes that must succeed together.
- Prevent duplicate records and submissions where required.

## Domain and Calculations

Preserve existing enums and API contracts:

- ExperienceMode: EXPERT / GUIDED.
- TargetMode: AUTO / MANUAL.
- MealType: use the existing shared definition.

Do not redefine domain values independently in different layers.

- Preserve daily target snapshots and meal-item nutrition snapshots.
- Historical values must not change when targets or source foods change.
- Centralize server calculations in the nutrition calculator service.
- Use shared client helpers for previews and consistent precision.
- Support nutrition per 100 g and per serving.
- Support servings without a known gram weight.
- Default to the saved serving when available.
- Convert units only with valid conversion data; never guess.
- Distinguish unknown nutrition values from zero.
- Preserve available source nutrients and provenance.
- Applying a template creates independent meal items with snapshots.
- Keep food search accessible; make filters explicit and reversible.
- Search all relevant server records, not only loaded pages.

## Dates and Refresh

- Use the selected Home date for meals, totals and related actions.
- Support past, present and future days.
- Handle local calendar dates consistently without UTC day shifts.
- Preserve the selected date across navigation.
- Keep previous/next controls, a calendar picker and return to Today.
- Do not add a permanent week strip unless requested.
- Keep copying meals to additional days discoverable.
- Update affected queries after changes, including dependent recipes and meals.
- Reflect successful logging, editing and removal immediately.
- Prevent duplicate taps and handle failures without losing drafts.
- Do not create empty database records just to display empty days.

## Product Flows

- Allow calculator results to be added directly to a meal and date.
- Preserve calculated quantities and units without repeated input.
- Make manually created products immediately available in the originating flow.
- Keep private product edits separate from shared catalog changes.
- Submit manual products for catalog review, including those without barcodes.
- Publish catalog submissions only after admin approval.
- Preserve users’ private copies and historical logs during catalog changes.
- Keep weight, measurements and progress photos optional and private.
- Do not silently change nutrition targets from progress entries.
- Keep admin actions authorized and auditable.
- Keep announcement targeting and per-user dismissal consistent.

## UX and Visual Design

Use the `balanceos-ui-pro` skill for UI/UX work.

- Prioritize clear hierarchy, readable numbers and quick actions.
- Keep common actions visible and secondary actions easy to find.
- Avoid repeated input, unnecessary dialogs and redundant information.
- Respect macro and percentage visibility settings everywhere.
- Keep controls consistent across screens.
- Ensure keyboard, sheets and bottom navigation do not hide content or actions.

Brand:

- Cobalt #365CF5 for primary actions and selection.
- Charcoal #191C26 for primary text.
- Cloud white #F6F7FA for light backgrounds.
- White #FFFFFF for light surfaces.
- Secondary text #586176.
- Soft mint #DDF7ED as a supporting accent.
- Dark green #08775A for positive feedback.
- Rubik for headings; Heebo for interface text and numbers.

Use shared theme tokens, restrained geometry and accessible contrast.
Support light and dark themes.
Avoid clutter, excessive rounding, decorative containers and forced motivation.

## Authentication and Privacy

- Store tokens in Expo SecureStore, never AsyncStorage.
- Use Axios interceptors for authentication and refresh.
- Clear authentication and user-specific caches when refresh fails.
- Clear user-specific state on logout or account changes.
- Keep sensitive records and progress photos accessible only to their owner.
- Never expose private photos through public URLs.

## Database Rules

“DB” means the BalanceOS PostgreSQL database.

- Use Prisma schema and migrations for schema changes.
- Use available Postgres tools or Prisma for inspection.
- Inspect relevant records only; avoid unnecessary personal-data output.
- For “show users”, list id, email, fullName, provider and createdAt.
- For “what users exist?”, query the User table only.
- For “check DB”, inspect relevant tables and records.
- For “delete user”, identify matching accounts before deletion.
- Require explicit approval for manual deletion or modification of existing user data.
- An explicit request to modify identified data is authorization for that scope.
- Routine app writes and authorized migrations do not need repeated approval.
- Use safe migrations; never reset or drop a user database without approval.
- Never expose credentials or secrets.

## Localization and Accessibility

- Default to Hebrew; support English and future languages.
- Keep code, filenames, types, DTOs and translation keys in English.
- Put user-facing text in translation files.
- Use locale and direction settings rather than hard-coded language checks.
- Verify RTL/LTR, directional icons and number/unit ordering.
- Support long names, mixed-language content and larger text.
- Provide accessible labels and comfortable touch targets.
- Respect safe areas and keyboard access.

## Validation and Reporting

- Run relevant type, lint, translation and behavior checks.
- Test affected calculations, ownership, dates and refresh behavior.
- Inspect rendered UI in Hebrew/English and both themes.
- Check narrow screens, larger text and loading/empty/error/selected states.
- Test actual user flows, not just isolated components.
- Distinguish mocked web checks, real-server tests and device tests.
- Never claim a check passed without running it.
- Report changes, checks, setup requirements and limitations concisely.
