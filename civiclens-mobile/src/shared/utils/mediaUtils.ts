/**
 * Media URL Utilities
 * Centralized helper functions for constructing media URLs
 */

import { ENV } from '@shared/config/env';

/**
 * Get the full media URL from a file_url
 * Handles both absolute URLs and relative paths
 * Also fixes localhost URLs from backend
 * 
 * @param url - The file_url from the backend
 * @returns Complete URL to access the media file
 */
export const getMediaUrl = (url: string): string => {
  if (!url) return '';

  // Handle explicit local URIs (e.g. from react-native-image-picker or expo)
  if (url.startsWith('file://') || url.startsWith('content://')) {
    return url;
  }

  // Handle cases where MinIO Base URL got prepended onto an internal Expo cache URI
  if (url.includes('/data/user/') || url.includes('/cache/ImagePicker/')) {
    const dataIndex = url.indexOf('/data/user/');
    if (dataIndex !== -1) {
      return 'file://' + url.substring(dataIndex);
    }
    const cacheIndex = url.indexOf('/cache/ImagePicker/');
    if (cacheIndex !== -1) {
      // expo prepends /data/user/... but we'll extract it using file protocol if it's there
      const fileIndex = url.indexOf('file://');
      if (fileIndex !== -1) {
        return url.substring(fileIndex);
      }
    }
  }



  // If already a full HTTP URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Replace Docker internal MinIO hostname with public MinIO endpoint
    // In production, backend stores URLs like: http://minio:9000/civiclens-media/...
    // These need to become: https://api.civiclens.space/civiclens-media/...
    if (url.includes('minio:9000')) {
      const fixedUrl = url.replace(/https?:\/\/minio:9000/, ENV.MINIO_BASE_URL);
      console.log('🔧 Fixed Docker MinIO URL:', url, '→', fixedUrl);
      return fixedUrl;
    }

    // Replace localhost with detected MinIO host (development)
    if (url.includes('localhost:9000') || url.includes('127.0.0.1:9000')) {
      const fixedUrl = url
        .replace('localhost:9000', ENV.MINIO_BASE_URL.replace('http://', '').replace('https://', ''))
        .replace('127.0.0.1:9000', ENV.MINIO_BASE_URL.replace('http://', '').replace('https://', ''));

      console.log('🔧 Fixed localhost URL:', url, '→', fixedUrl);
      return fixedUrl;
    }
    return url;
  }

  // If it happens to be embedded weirdly as a string
  if (url.includes('file://')) {
    return url.substring(url.indexOf('file://'));
  }

  // For relative URLs, construct full URL with MinIO endpoint
  const fullUrl = url.startsWith('/')
    ? `${ENV.MINIO_BASE_URL}${url}`
    : `${ENV.MINIO_BASE_URL}/${url}`;

  return fullUrl;
};

/**
 * Get thumbnail URL for an image
 * Falls back to original URL if no thumbnail exists
 */
export const getThumbnailUrl = (url: string): string => {
  // For now, return the original URL
  // In the future, we can implement thumbnail generation
  return getMediaUrl(url);
};

/**
 * Check if a URL is a valid media URL
 */
export const isValidMediaUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const fullUrl = getMediaUrl(url);
    new URL(fullUrl);
    return true;
  } catch {
    return false;
  }
};
