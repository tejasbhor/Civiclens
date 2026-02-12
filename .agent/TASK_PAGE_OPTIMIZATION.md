# Tasks Page UI Consistency & Optimization

## Summary
Refactored the `TasksPage` to strictly adhere to the standardized UI patterns found in the Dashboard and Reports pages. The update focuses on layout consistency, component usage, and code optimization.

## Key Changes

1.  **Layout alignment**:
    *   Removed redundant `bg-gray-50` and `min-h-screen` classes from the page root, allowing the `DashboardLayout` to handle global styling.
    *   Removed root padding (`p-6`) to rely on the layout's standard `p-8` spacing.
    *   Increased header title size to `text-3xl` to match `DashboardPage`.

2.  **Component Optimization**:
    *   Replaced all inline HTML/CSS badges (e.g., `<span class="badge...">`) with the standardized `<Badge>` component from the UI library.
    *   Integrated `Badge` component's built-in status color logic, removing the need for manual class utilities (`getStatusBadgeClasses`).
    *   Standardized `Card` padding to `p-6` and grid gaps to `gap-6`.

3.  **Code Cleanup**:
    *   Removed unused imports: `TaskCard`, `getStatusBadgeClasses`, `getSeverityBadgeClasses`, `toLabel`.
    *   Fixed `Button` variant type error (replaced invalid `'default'` with `'primary'`).
    *   Restored missing imports for types and modals that were briefly disrupted during refactoring.

## Result
The `TasksPage` now seamlessly blends with the application's overall design system, using shared components and consistent spacing/typography conventions.
