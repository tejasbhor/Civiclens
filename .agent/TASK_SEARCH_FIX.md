# Task Search and Filter Fix

## Issue
The user encountered a **500 Internal Server Error** when trying to load or filter tasks. The error originated from `TasksAPI.getTasks`.

## Root Cause
The `getTasks` method in `src/lib/api/tasks.ts` was manually constructing a query string using `skip` and `limit` parameters (`skip` calculated from page number). The backend API (likely consistent with Reports API) expects `page` and `per_page` parameters directly, or failed to handle the manual query string construction correctly causing a server-side exception.

## Resolution
Refactored `TasksAPI.getTasks` to:
1.  Use `apiClient`'s `params` option for safe parameter serialization.
2.  Send `page` and `per_page` parameters instead of calculating `skip` and `limit`.
3.  Cleanly merge the `filters` object (status, search query, priority, sort) into the request parameters.

## Verification
-   **Search Bar**: Now correctly passes the `search` parameter to the API via `getTasks`.
-   **Filters**: Status, Priority, and Sort filters are correctly included in the API request.
-   **Pagination**: Uses standard `page`/`per_page` compatible with the backend.

## Files Updated
-   `src/lib/api/tasks.ts`
