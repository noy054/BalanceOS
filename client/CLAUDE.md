# BalanceOS Client — Claude Instructions

## Stack

Use:

- Expo
- React Native
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- Axios
- React Native Paper
- Expo SecureStore

## Product UX

BalanceOS is expert-first, guided-friendly.

Expert users need:

- fast logging
- numbers first
- manual control
- advanced macros
- templates
- weekly balance
- minimal guidance

Guided users may get:

- suggestions
- explanations
- meal ideas
- mature guidance

Do not build two separate apps.
Use `experienceMode` to show/hide guided or advanced UI.

## Communication

- Explain before editing.
- Make small, safe changes.
- Do not rewrite unrelated files.
- Avoid `any`.

## Architecture

Use feature-based structure:

```txt
src/
  features/
    auth/
    user-settings/
    day-log/
    meals/
    food/
    templates/
    reports/
  shared/
    api/
    components/
    hooks/
    utils/
    types/
    constants/
    theme/
```

Each feature can include:

```txt
api/
hooks/
types/
components/
constants.ts
helpers/
```

Only create folders when needed.

## Screen Rules

Screens should stay thin.

Screens may:

- compose components
- call hooks
- handle navigation

Screens must not:

- call Axios directly
- contain complex business logic
- calculate nutrition totals
- become huge files

## API Rules

- Use Axios only through the API layer.
- Keep API functions typed.
- Keep request/response types in feature `types`.
- If backend response changes, update client types and hooks.

## State Rules

Use TanStack Query for server state:

- day log
- meals
- templates
- user settings
- food search
- reports

Use Zustand only for local UI state:

- selected date
- active tab
- modal state
- temporary draft
- onboarding step

Do not store server data in Zustand.

## Types

Use strong types:

```ts
export type ExperienceMode = "EXPERT" | "GUIDED";
export type TargetMode = "AUTO" | "MANUAL";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK_1" | "SNACK_2";
```

Avoid `any`.

## Auth

- Store tokens in Expo SecureStore.
- Do not store tokens in AsyncStorage.
- Use Axios interceptors for access token and refresh token.
- Logout user if refresh fails.

## UI Rules

The app should feel like a serious nutrition control system.

Prefer:

- clean layout
- fast actions
- readable numbers
- mature tone
- reusable components

Avoid:

- childish messages
- forced motivation
- clutter
- hiding advanced data from expert users
- unnecessary libraries
