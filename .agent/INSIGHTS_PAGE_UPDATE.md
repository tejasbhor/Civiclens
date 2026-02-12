# Insights Page Update for UI Consistency

## Summary
Updated `InsightsPage` (`src/app/dashboard/insights/page.tsx`) to match the project's UI standards, ensuring consistency with Dashboard, Reports, and Profile pages.

## Key Changes

1.  **Layout & Typography**:
    *   Standardized Header title to `text-3xl font-bold`.
    *   Maintained `space-y-6` layout.

2.  **Component Standardization**:
    *   **Buttons**: Replaced all raw HTML `<button>` elements with the shared `<Button>` component (`primary`, `outline`, `ghost` variants).
    *   **Cards**: Replaced manual `div` cards with the reusable `<Card>` component.
    *   **Inputs/Selects**: Replaced raw inputs and selects with `<Input>` and `<SimpleSelect>` components.
    *   **Badges**: Updated `<Badge>` usage to use standard Tailwind classes.

3.  **Code Optimization**:
    *   Improved readability and maintainability by using reusable components.
    *   Fixed import casing for `Input`.

## Result
The duplicate insights page is now fully optimized, production-ready, and aligns with the application's design system.
