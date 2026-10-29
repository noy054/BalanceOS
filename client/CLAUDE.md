# BalanceOS Client — Claude Instructions

## Stack

Expo, React Native, TypeScript, Expo Router, TanStack Query, Zustand, Axios, React Native Paper, Expo SecureStore.

## Product

BalanceOS is a smart nutrition calculator and daily management tool for people who already track calories and macros independently and consistently.

The core promise: the same precision and control, with less effort.

Users repeat familiar products, meals and recipes, adjusting quantities over time. Prioritize:

- Fast logging and calculations.
- Reusing saved meals, recipes and previous calculations.
- Quick quantity adjustments with immediate nutrition updates.
- Manual control and reliable, readable numbers.
- Managing past, present and future days.
- Minimal steps and mental effort.

The initial audience is experienced trainees, but the product must work regardless of training or body goals.

Respect existing `experienceMode` behavior. Keep guided features optional and secondary. Do not build separate apps or add unsolicited coaching, motivation or meal advice.

## Working Rules

- Briefly explain the intended change before editing.
- Make focused, safe changes and preserve unrelated work.
- Review existing implementations before adding new components.
- Preserve functionality, user data, settings and historical nutrition.
- Do not add code comments.
- Avoid `any` and unnecessary dependencies.
- Do not commit or push unless requested.

## Architecture

Follow the existing feature-based structure; do not rename folders to match an example.

Each feature may contain:

- `api/`
- `hooks/`
- `types/`
- `components/`
- `helpers/`
- `constants.ts`

Keep shared infrastructure in `shared/`. Create folders only when needed.

Screens should compose components, call hooks and handle navigation. Keep API calls, complex business logic and nutrition calculations outside screens.

## API and State

- Access Axios only through the typed API layer.
- Keep feature request/response types in the feature.
- Update types and hooks whenever API contracts change.
- Use TanStack Query for server data.
- Use Zustand for local UI state such as selected date, dialogs and drafts.
- Do not duplicate server data in Zustand.
- Refresh all affected queries after mutations.
- Home totals and lists must update immediately after successful changes.
- Prevent duplicate submissions and handle loading, errors and retries.
- Search must cover all server records, not only loaded pages.

## Nutrition and Dates

- Support nutrition defined per 100 g or per serving.
- Servings must work without a known gram weight.
- Default to the product’s saved serving.
- Convert units only when valid conversion data exists; never guess.
- Keep unknown nutrients distinct from zero.
- Reuse centralized calculation helpers and consistent precision.
- Preserve logged nutrition snapshots when source products change.
- Calculator results must be addable directly to a selected meal/date.
- The selected Home date controls meals, totals and related actions.
- Use local calendar dates consistently; avoid UTC date shifts.
- Preserve the selected date across navigation.
- Keep previous/next controls, a date picker and return to Today.
- Do not add an always-visible week strip unless requested.
- Keep copying meals to additional days easy to discover.

## Authentication and Privacy

- Store tokens in Expo SecureStore, never AsyncStorage.
- Use Axios interceptors for authentication and token refresh.
- Clear authentication and user-specific caches when refresh fails or users log out.
- Treat server authorization as authoritative.
- Keep progress entries and photos private to their owner.

## Brand and Visual Design

The interface should feel smart, clear, precise and effortless.

Palette:

- Cobalt: `#365CF5` — primary actions and selection.
- Charcoal: `#191C26` — primary text.
- Cloud white: `#F6F7FA` — light background.
- White: `#FFFFFF` — light surfaces.
- Secondary text: `#586176`.
- Soft mint: `#DDF7ED` — occasional supporting accent.
- Dark green: `#08775A` — positive feedback.

Typography:

- Rubik for headings.
- Heebo for interface text and numbers.
- Use a restrained range of sizes and weights.

Use shared theme tokens and components. Support both themes with accessible contrast.

References provide inspiration, not exact layouts. Use design judgment and applicable design skills. Current user direction takes precedence over outdated skill styling.

Avoid excessive rounding, nested cards, repeated borders, decorative icon tiles and unnecessary shadows. Use restrained corner radii, consistent spacing and clear alignment.

Do not turn nutrition screens into dense spreadsheets or long strings of tiny macro text. Keep names, serving basis, calories and secondary values easy to distinguish.

## UX and Accessibility

- Preserve existing features when redesigning.
- Keep frequent actions visible and secondary actions discoverable.
- Respect macro and percentage visibility settings everywhere.
- Provide clear selection, deselection, editing and save feedback.
- Support long names, mixed Hebrew/English text and narrow screens.
- Use locale and direction settings rather than hard-coded language checks.
- Verify RTL/LTR, directional icons, and number/unit ordering.
- Keep content and actions reachable with the keyboard open.
- Respect safe areas, bottom navigation and larger system text.
- Provide accessible labels and comfortable touch targets.
- Keep weight, measurements and photos optional, with neutral wording.

## Validation

Run relevant type, translation, lint and behavior checks.

Visually inspect rendered screens in:

- Hebrew and English.
- Light and dark themes.
- Narrow and standard phone widths.
- Loading, empty, error and selected states.

Test affected calculations, date navigation, logging, editing, copying and refresh behavior.

Distinguish mocked UI checks from real-server and device tests. Never claim device validation without running it.

Finish with a concise summary of changes, checks and remaining limitations.
