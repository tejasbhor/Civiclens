# Media Type Mapping Fix

## Issue
The user reported that the Media Gallery was displaying images as generic file boxes ("Image File") instead of rendering the actual image content. This occurred in the `ViewReportModal` (via `ReportDetail`) and would also affect `EditReportModal`.

## Root Cause
- The API returns `file_type` as lowercase strings (e.g., `'image'`, `'audio'`).
- The `MediaGallery` component matches against the `MediaType` enum, which expects uppercase strings (e.g., `'IMAGE'`).
- The strict equality check (`===`) failed, causing the gallery to fallback to the default file view.

## Resolution
Updated the data mapping logic in both `ReportDetail.tsx` and `EditReportModal.tsx` to explicitly convert `file_type` to uppercase before passing it to the `MediaGallery` component.

### Files Updated
- `src/components/reports/ReportDetail.tsx`
- `src/components/reports/modals/EditReportModal.tsx`

## Verification
- Confirmed `file_type` is now `(m as any).file_type?.toUpperCase()`.
- Fixed a generic type casting error in `ReportDetail.tsx` where the map result was incorrectly cast creating a nested array type.
