# BalanceOS — Claude Instructions

## Product

BalanceOS is a nutrition management platform.

It is expert-first, guided-friendly.

Primary audience:

- users who already understand nutrition
- they know calories, protein, macros, cutting/maintenance/bulking
- they need speed, precision, control, templates, and reports
- they do not need forced motivation or childish coaching

Secondary audience:

- users who need guidance
- they may receive suggestions, explanations, and meal ideas
- tone must stay mature and practical

The app must feel like a serious nutrition control system, not a generic diet motivation app.

## Core Principles

- Help users manage nutrition without shame.
- Never use “you failed” style messaging.
- Show facts: eaten, remaining, targets, weekly balance, and next options.
- Expert users must always have manual control.
- Guided features are optional layers, not the core product.

## Tech Stack

Client:

- Expo
- React Native
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- Axios
- React Native Paper
- SecureStore for tokens

Server:

- NestJS
- TypeScript
- REST API
- PostgreSQL
- Prisma
- JWT + refresh tokens

Architecture:

- Modular Monolith
- Clean Architecture
- Feature-based frontend
- Domain-based backend modules

## Communication Rules

- Explain the plan before editing.
- Make small, safe changes.
- Do not rewrite unrelated code.
- Do not use `any` unless you explain why.
- If a task affects both client and server, inspect both.

## Architecture Rules

Frontend:

- Screens should stay thin.
- Use `api`, `hooks`, `types`, `components`, `constants`, and `helpers`.
- Do not call Axios directly inside screens.
- Use TanStack Query for server state.
- Use Zustand only for local UI state.

Backend:

- Controllers handle HTTP only.
- Services contain business logic.
- Repositories handle database access.
- Do not call Prisma directly from controllers.
- Validate DTOs.
- Always check user ownership.

## Core Domain Rules

Support:

```ts
type ExperienceMode = "EXPERT" | "GUIDED";
type TargetMode = "AUTO" | "MANUAL";
type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK_1" | "SNACK_2";
```

Important:

- `DayLog` must store `targetsSnapshot`.
- `MealItem` must store `macrosSnapshot`.
- Old nutrition history must not change when targets or food data change.
- Nutrition calculations must live in a dedicated calculator service.
- Food search must not be hidden by exclusion rules.
- Applying a template creates new meal items with fresh snapshots.

## Main Domains

- Auth
- Users
- Nutrition Settings
- Day Logs
- Meals
- Meal Items
- Food
- Barcode
- Templates
- Exclusions
- Reports
- Weekly Balance

## Do Not Do

- Do not build two separate apps for expert/guided users.
- Do not make motivation the default product identity.
- Do not hide advanced data from expert users.
- Do not create huge files.
- Do not put API calls in UI screens.
- Do not put DB logic in controllers.
- Do not skip validation or ownership checks.
- Do not expose secrets or edit `.env` files.

## Database Shortcuts

When I say "DB", I mean the BalanceOS PostgreSQL database.

Use this priority:

1. For schema changes: use Prisma schema and migrations.
2. For reading existing data: use Postgres MCP or Prisma.
3. For deleting/updating data: ask for confirmation first.

When I ask:

- "show users" = list users with id, email, fullName, provider, createdAt
- "delete user" = first list matching users, then ask before deleting
- "check DB" = inspect tables and current relevant records
- "what users exist?" = query the User table only

Never delete DB data without explicit approval.
Never expose secrets.
