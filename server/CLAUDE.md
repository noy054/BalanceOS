# BalanceOS Server — Claude Instructions

## Stack

Use:

- NestJS
- TypeScript
- REST API
- PostgreSQL
- Prisma
- JWT access tokens
- Refresh tokens

## Product Context

BalanceOS is expert-first, guided-friendly.

The backend must support:

- precise tracking
- manual control
- nutrition targets
- day logs
- meals
- meal items
- templates
- weekly balance
- optional guided suggestions later

Expert users must always be able to override calculated values.

## Communication

- Explain before editing.
- Make small, safe changes.
- Do not rewrite unrelated files.
- Avoid `any`.
- Do not change API contracts without checking the client.

## Architecture

Use Modular Monolith with clean separation.

Recommended modules:

```txt
src/
  modules/
    auth/
    users/
    nutrition-settings/
    day-logs/
    meals/
    meal-items/
    food/
    templates/
    exclusions/
    reports/
    nutrition-calculator/
  common/
    decorators/
    guards/
    filters/
    interceptors/
    pipes/
    utils/
    types/
  prisma/
```

## Layer Rules

Controllers:

- handle HTTP only
- receive params, body, query, current user
- do not contain business logic
- do not call Prisma directly

Services:

- contain business logic
- validate product behavior
- call repositories
- call calculator when nutrition totals change

Repositories:

- handle database access only
- use Prisma
- do not contain product decisions

## Core Types

Support:

```ts
type ExperienceMode = "EXPERT" | "GUIDED";
type TargetMode = "AUTO" | "MANUAL";
type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK_1" | "SNACK_2";
```

## Domain Rules

- `DayLog` must store `targetsSnapshot`.
- `MealItem` must store `macrosSnapshot`.
- Old nutrition history must not change when targets or food data change.
- Applying a template creates new meal items with fresh snapshots.
- Food search must not be hidden by exclusion rules.
- Nutrition calculations must live in `nutrition-calculator`.
- Do not duplicate calculation logic across services.

## Database Rules

Use PostgreSQL with Prisma.

Main models:

- User
- UserNutritionSettings
- DayLog
- MealEntry
- MealItem
- FoodItem
- FoodServing
- MealTemplate
- TemplateItem
- ExclusionRule
- WeightLog

Use relations for core data.
Use JSON only for snapshots or metadata.

Add indexes for common queries:

- DayLog: userId + date
- FoodItem: barcode
- Templates: userId

## Transaction Rules

Use transactions when changing multiple related records.

Examples:

- add meal item + recalculate day log
- delete meal item + recalculate day log
- apply template
- update targets and create/update day log

Never leave day totals stale after meal changes.

## Auth Rules

- Use JWT access tokens and refresh tokens.
- Never store plain passwords.
- Never return password hashes.
- Never log tokens.
- Never trust client-provided userId.
- Use authenticated user id from token.

## Ownership Rules

Always check user ownership for:

- DayLog
- MealEntry
- MealItem
- MealTemplate
- ExclusionRule
- UserNutritionSettings
- WeightLog

A user must never access or update another user's data.

## DTO and Validation Rules

- Use DTOs for requests.
- Validate required fields.
- Validate enums.
- Validate positive numbers.
- Validate dates.
- Validate macro values.
- Return clear errors.

## API Rules

Use REST.

Core endpoints may include:

- `/auth`
- `/me`
- `/nutrition-settings`
- `/day-logs`
- `/meals`
- `/meal-items`
- `/food`
- `/templates`
- `/exclusions`
- `/reports`

When response shape changes:

- update DTO/mapper
- update client types
- update client hooks

## Do Not Do

- Do not call Prisma from controllers.
- Do not put business logic in controllers.
- Do not skip ownership checks.
- Do not skip validation.
- Do not use `any` to silence errors.
- Do not expose secrets or edit `.env` files.
- Do not make motivation the default product identity.
- Do not block expert users with guided flows.
- Do not over-engineer the MVP.
