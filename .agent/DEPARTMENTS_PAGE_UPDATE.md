# Departments Page Update for UI Consistency

## Summary
Updated `DepartmentsPage` (`src/app/dashboard/departments/page.tsx`) to match the project's UI standards, ensuring consistency with other dashboard pages.

## Key Changes

1.  **Layout & Typography**:
    *   Replaced non-standard layout wrapper (`bg-gray-50 min-h-screen`) with standard `space-y-6`.
    *   Updated Header title to `text-3xl font-bold` for consistency.

2.  **Component Standardization**:
    *   **Buttons**: Replaced raw HTML `<button>` elements with the shared `<Button>` component (`primary`, `ghost` variants).
    *   **Cards**: Replaced manual `div` cards (search bar, departments grid, performance table) with the reusable `<Card>` component.
    *   **Inputs**: Replaced raw search input with `<Input>`.
    *   **Badges**: Replaced manual `span.badge` elements with the `<Badge>` component.

## Result
The departments page is now production-ready, visually consistent, and uses the application's shared component library.
