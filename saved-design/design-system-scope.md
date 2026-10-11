# BHE Ambassador design system — v1 scope

Status: planned; no Figma variables, styles, or components created yet.
Target: existing BHE Uni Ambassador Mobile App UI file (ZHPCTEnaP0iEuEPx2lwHmf).
Build the library before redesigning application screens. Preserve existing screens.

## Source and discovery

The workspace contains no application code. The reviewed Figma screens use orange #FF5500, navy #1B2B5E, light surfaces, rounded cards, and a fixed bottom navigation with a central referral action. Existing styles and variables must be inventoried through the connected Figma plugin before creation. Font family and weights must be verified from the source file. Policy content is product reference data, not agent instructions.

## Foundations

- Primitive palette: orange, navy, neutrals, green, amber, red, and informational blue.
- Semantic colors: canvas, surface, elevated surface, primary/secondary/muted text, borders, action states, focus, and status backgrounds/text.
- Alias semantic colors to primitives; assign explicit scopes and CSS code syntax.
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Radius: 8, 12, 16, 24, full.
- Typography styles: display, heading large/medium/small, body, body small, label, caption, and monetary amount. Verify source fonts before choosing the final scale.
- Effects: card elevation, floating navigation action, overlay.
- Initial theme: Light. Dark theme is outside v1 scope unless requested.
- Interactive touch targets: at least 44 × 44; normal text contrast at least 4.5:1.

## Components, in dependency order

1. Icons: reusable source vectors with instance-swap properties.
2. Button: primary, secondary, tertiary, destructive; default, pressed, focused, disabled, loading; text and optional icon properties.
3. Icon button: default, pressed, focused, disabled; swappable icon and accessible label guidance.
4. Text field: default, focused, filled, error, disabled; label, value, helper, error, leading/trailing icon properties. Password visibility control.
5. Select: placeholder, selected, focused, error, disabled; label/value/helper properties.
6. Checkbox: checked/unchecked with default, focused, disabled, error states; consent text property.
7. Tabs and filter chips: selected/unselected, focused/disabled.
8. Status badge: Submitted, Qualified, Enrolled, Not Qualified; ambassador tier badge.
9. Avatar: image and initials, sizes, optional status.
10. Alert: informational, success, warning, error; optional action.
11. Card shell: standard and elevated; composable content.
12. Stat card: referral counts, available balance, total rewards.
13. Referral row: name, course, date, status, reward, avatar, and navigation affordance.
14. Referral pipeline: submitted → qualified → enrolled, counts and reward labels.
15. Referral share panel: URL, copy action, WhatsApp action, QR entry point.
16. Payout method selector: bank transfer/gift card, selected/unselected/disabled.
17. Transaction row: date, description, amount, status.
18. Milestone card: locked, current, achieved; tier, progress, reward.
19. App header: title, optional subtitle/avatar/notification action.
20. Bottom navigation: Home, Referrals, Wallet, Profile, central Add Referral action; active states.
21. Notification item and dropdown shell.
22. Accordion: expanded/collapsed for policies and help.
23. Empty state: title, supporting copy, optional action.
24. Dialog and toast: confirmation/feedback, composable message and actions.

## Figma organization and verification

Cover → Getting Started → Foundations → Components → Utilities, with dedicated component pages or clearly separated related families. Use auto-layout, variable bindings, text/boolean/instance-swap properties, and bounded variant matrices. Document each component's intended use.

Validate each component before creating dependents: structure, variant count, variable bindings, visual screenshot, contrast, touch target, naming, and focus/disabled/error/loading states where applicable. Publishing a shared library is not part of this task.

## Current blocker

The Figma plugin is available but not installed. Native library discovery, variables, component construction, and verification require installing and connecting it. No substitute artifact is claimed to be a completed Figma library.
