# Edit Report Modal Media Integration

## Summary
Integrated the `MediaGallery` component into the `EditReportModal` to allow administrators to view report evidence (images/videos) while editing report details.

## Changes
1.  **Modified `EditReportModal.tsx`**:
    *   Imported `MediaGallery` and `mediaApi`.
    *   Added fetching logic to load media files for the report.
    *   Placed the `MediaGallery` component above the edit form for easy reference.
2.  **Modified `MediaGallery.tsx`**:
    *   Increased z-index of the full-screen viewer to `z-[100]` to ensure it layers correctly on top of the Edit Modal (which uses `z-50`).

## Result
Users can now view, zoom, and verify media evidence without leaving the "Edit Report" context, improving workflow efficiency and accuracy.
