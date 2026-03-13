/**
 * Media URL Utilities for CivicLens Client
 * Centralized helper for constructing media URLs
 */

/**
 * Get the base URL for the backend server (without /api/v1)
 */
export const getBackendBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return apiUrl.replace(/\/api\/v1\/?$/, '');
};

/**
 * Construct a proper media URL from a file_url
 * Handles both absolute URLs and relative paths.
 * Rewrites Docker-internal MinIO URLs (minio:9000) to the public API domain.
 *
 * @param url - The file_url from the backend
 * @returns Complete URL to access the media file
 */
export const getMediaUrl = (url: string): string => {
    if (!url) return '';

    // If it's already a complete URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Rewrite Docker-internal MinIO URLs to the public API proxy
        // DB stores: http://minio:9000/civiclens-media/uploads/file.jpg
        // Rewrite to: https://api.civiclens.space/civiclens-media/uploads/file.jpg
        if (url.includes('minio:9000')) {
            const backendBaseUrl = getBackendBaseUrl();
            return url.replace(/https?:\/\/minio:9000/, backendBaseUrl);
        }
        return url;
    }

    // If it's a relative path, construct the full URL
    const backendBaseUrl = getBackendBaseUrl();
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${backendBaseUrl}${path}`;
};
