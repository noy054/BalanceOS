---
name: balanceos-ui-pro
description: Design and improve BalanceOS UI and UX, prioritizing simplicity, readability and fast daily actions. Use for screens, components, navigation, food cards, forms and visual reviews.
---

# BalanceOS UI/UX

## Product

BalanceOS is a smart nutrition management tool for people who already track calories and macros independently.

Users repeat familiar meals, products and recipes, with small quantity adjustments.

The promise: the same precision and control, with less effort.

## Core Principle

Make the app simple, readable and efficient.
Users should understand each screen immediately and complete frequent tasks with minimal taps, typing and navigation.

Prioritize usability over decoration.

## Workflow

- Review the existing implementation and affected user flows.
- Identify the main task and unnecessary steps.
- Use applicable design skills and available references.
- Treat references as inspiration, not layouts to copy exactly.
- Implement with shared components and theme tokens.
- Inspect rendered screens and test interactions.
- Preserve existing features, data, calculations and settings.
- Do not add code comments.

## UX Rules

- Prioritize finding food, changing quantities, logging and reusing meals.
- Keep frequent actions visible and easy to reach.
- Place actions close to the content they affect.
- Give each screen a clear primary action.
- Use sensible defaults and preserve useful selections.
- Avoid repeated input and unnecessary navigation.
- Keep search accessible and results easy to scan.
- Update calculations immediately as quantities change.
- Show clear loading, success and error feedback.
- Prevent duplicate submissions without slowing routine actions.
- Confirm destructive actions and prefer undo where appropriate.
- Reveal secondary details progressively.
- Do not hide frequently used features in overflow menus.
- Keep forms, results and save actions accessible with the keyboard open.
- Preserve drafts when navigation or recoverable errors interrupt a task.

## UI Rules

- Create clear hierarchy through typography, spacing and alignment.
- Make names, quantities, units and nutrition values easy to distinguish.
- Align comparable numbers and use consistent precision.
- Keep text readable; never shrink it to force a layout.
- Avoid dense tables, long macro strings and repeated labels.
- Avoid excessive containers, borders, shadows and decorative icons.
- Use restrained corner radii and consistent spacing.
- Use an 8pt spacing system and touch targets of at least 44pt.
- Balance compact layouts with comfortable reading.
- Keep controls and action placement consistent across screens.

## Brand

The interface should feel clear, calm, precise, modern and professional.

Colors:

- Primary actions and selection: #365CF5
- Primary text: #191C26
- Light background: #F6F7FA
- Light surfaces: #FFFFFF
- Secondary text: #586176
- Supporting mint: #DDF7ED
- Positive feedback: #08775A

Use cobalt as the main accent and mint sparingly.
Adapt the palette for dark mode with accessible contrast.
Never rely on color alone to communicate meaning.
Avoid guilt-based red/green treatment of nutrition totals.

Typography:

- Rubik for headings.
- Heebo for interface text and numbers.
- Use a restrained range of sizes and weights.

## Home

Make the selected day understandable at a glance.

Prioritize:

1. Remaining calories or amount over target.
2. Consumed calories and target.
3. Protein and enabled macros.
4. Meals and logging actions.

Keep date navigation compact:

- Previous/next day.
- Calendar picker.
- Return to Today.
- Clear selected date.
- No permanent week strip unless requested.

Keep meal quantities, calories and editing easy to find.
Keep copying meals to additional days visible.
Give empty meals a lightweight add action.
Avoid redundant indicators and oversized summaries that push meals away.

## Pantry and Food Cards

Make saved food easy to find, compare and reuse.

Use a consistent hierarchy:

- Name.
- Serving basis and relevant brand.
- Calories and enabled nutrition values.
- Relevant actions or selection state.

Keep values structured and readable without crowding the card.
Handle long names and wrapping deliberately.
Use images consistently without decorative placeholders.
Respect macro visibility settings everywhere.
Show whether nutrition is per serving or per 100 g.
Keep unknown values distinct from zero.

## Add Food and Calculator

- Keep search, scan and manual creation easy to discover.
- Make selection and deselection obvious.
- Default to the saved serving when available.
- Support servings without grams; never invent conversions.
- Make quantity changes quick, with live nutrition feedback.
- Keep the destination meal and date clear.
- Add calculator results directly without re-entry.
- Keep the selection summary concise and saving accessible.
- Avoid panels that obscure results or require unnecessary scrolling.
- Update Home and affected lists immediately after successful changes.

## Settings and Progress

- Organize settings into clear groups and focused sub-screens.
- Avoid long, compressed forms and duplicate labels.
- Keep dangerous actions separate and clearly explained.
- Keep weight, measurements and photos optional.
- Use neutral language without assuming weight loss.
- Preserve privacy and existing preferences.

## Tone

Use clear, direct, mature and non-judgmental language.
Keep explanations brief and contextual.
Avoid forced motivation, exaggerated praise and childish messaging.
Respect experienced users’ knowledge and independence.

## Localization and Accessibility

- Support Hebrew/English and RTL/LTR.
- Use locale and direction settings rather than language-specific assumptions.
- Verify directional icons and number/unit ordering.
- Support mixed-language names and larger system text.
- Provide accessible names without unnecessary visible repetition.
- Respect safe areas and bottom navigation.

## Validation

Inspect Hebrew and English, both themes, at 320px and 390px.
Check larger text, keyboard access, scrolling and content wrapping.
Verify loading, empty, error, selected and disabled states.
Test affected calculations, logging, editing, copying and refresh behavior.
Run relevant project checks.

For every flow, ask:

- Is the screen understandable at a glance?
- Is the main action obvious?
- Can the task require fewer taps or less typing?
- Is any information repeated unnecessarily?
- Is the result and save status clear?

Distinguish mocked web checks from real-server and device tests.
Finish with a concise summary of changes, checks and limitations.
