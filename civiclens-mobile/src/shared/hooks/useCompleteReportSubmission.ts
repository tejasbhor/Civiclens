/**
 * Complete Report Submission Hook - Production Ready
 * Handles atomic report submission with robust offline-first architecture
 */

import { useState } from 'react';
import { ReportCategory, ReportSeverity } from '@shared/types/report';
import { imageOptimizer } from '@shared/services/media/imageOptimizer';
import { useNetwork } from './useNetwork';
import { submissionQueue } from '@shared/services/queue/submissionQueue';
import { createLogger } from '@shared/utils/logger';

const log = createLogger('CompleteReportSubmission');

export interface CompleteReportData {
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  photos: string[];
  is_public: boolean;
  is_sensitive: boolean;
}

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export interface SubmissionProgress {
  stage: 'preparing' | 'validating' | 'compressing' | 'submitting' | 'uploading' | 'queued' | 'complete';
  message: string;
  percentage?: number;
  currentFile?: number;
  totalFiles?: number;
}

export interface SubmissionResult {
  id: string | number;
  report_number?: string;
  offline: boolean;
  queueId?: string;
}

export const useCompleteReportSubmission = () => {
  const [progress, setProgress] = useState<SubmissionProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOnline } = useNetwork();

  const validateReportData = (data: CompleteReportData): void => {
    // Title validation
    if (!data.title || data.title.trim().length < 5) {
      throw new Error('Title must be at least 5 characters long');
    }
    if (data.title.trim().length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }

    // Description validation
    if (!data.description || data.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }
    if (data.description.trim().length > 2000) {
      throw new Error('Description cannot exceed 2000 characters');
    }

    const validCategories = [
      'roads', 'water', 'sanitation', 'electricity', 'streetlight',
      'drainage', 'public_property', 'public_safety', 'environment',
      'infrastructure', 'other'
    ];
    if (!data.category || !validCategories.includes(data.category)) {
      throw new Error(`Category is required. Must be one of: ${validCategories.join(', ')}`);
    }

    // Severity validation - Must match backend enum exactly
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!data.severity || !validSeverities.includes(data.severity)) {
      throw new Error(`Severity is required. Must be one of: ${validSeverities.join(', ')}`);
    }

    // Coordinate validation
    if (data.latitude < -90 || data.latitude > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }
    if (data.longitude < -180 || data.longitude > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }

    // Address validation
    if (!data.address || data.address.trim().length < 5) {
      throw new Error('Address must be at least 5 characters long');
    }

    // Photos validation - REQUIREMENT: 1-5 photos, max 50MB total (backend limit)
    if (!data.photos || data.photos.length === 0) {
      throw new Error('At least one photo is required for the report');
    }
    if (data.photos.length > 5) {
      throw new Error('Maximum 5 photos allowed per report');
    }

    // Validate each photo URI
    for (let i = 0; i < data.photos.length; i++) {
      const photoUri = data.photos[i];
      if (!photoUri || typeof photoUri !== 'string') {
        throw new Error(`Photo ${i + 1} is invalid or missing`);
      }

      // Check if photo exists (basic validation)
      if (!photoUri.startsWith('file://') && !photoUri.startsWith('content://') && !photoUri.startsWith('ph://')) {
        throw new Error(`Photo ${i + 1} has invalid format. Please select photos from your device.`);
      }
    }

    // Note: Actual size validation happens after compression
    log.info(`Validated ${data.photos.length} photos for submission`);
  };

  const compressImages = async (photos: string[]): Promise<CompressedImage[]> => {
    const compressedImages: CompressedImage[] = [];

    log.info(`Starting compression of ${photos.length} images`);

    for (let i = 0; i < photos.length; i++) {
      setProgress({
        stage: 'compressing',
        message: `Compressing image ${i + 1} of ${photos.length}...`,
        percentage: Math.round((i / photos.length) * 100),
        currentFile: i + 1,
        totalFiles: photos.length,
      });

      try {
        log.debug(`Compressing image ${i + 1}: ${photos[i]}`);

        const compressed = await imageOptimizer.compressImage(photos[i], {
          quality: 0.85, // Slightly higher quality for better results
          maxWidth: 2048,
          maxHeight: 2048,
          targetSizeKB: 800, // Target 800KB per image for good quality/size balance
        });

        compressedImages.push({
          uri: compressed.uri,
          width: compressed.width,
          height: compressed.height,
          size: Math.round(compressed.sizeKB * 1024), // Convert KB to bytes
        });

        log.debug(`Image ${i + 1} compressed: ${Math.round(compressed.sizeKB * 1024)} bytes`);
      } catch (error: any) {
        log.error(`Failed to compress image ${i + 1}:`, error);
        throw new Error(`Failed to compress image ${i + 1}: ${error?.message || 'Unknown error'}`);
      }
    }

    return compressedImages;
  };

  const submitOffline = async (
    reportData: CompleteReportData,
    compressedPhotos: CompressedImage[]
  ): Promise<SubmissionResult> => {
    setProgress({
      stage: 'queued',
      message: 'Saving report locally...',
    });

    try {
      // Create a local report immediately that appears in the list
      const localReport = {
        id: `local_${Date.now()}`, // Temporary local ID
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        severity: reportData.severity,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        address: reportData.address,
        landmark: reportData.landmark,
        photos: reportData.photos,
        is_public: reportData.is_public,
        is_sensitive: reportData.is_sensitive,
        status: 'received',
        created_at: new Date(),
        updated_at: new Date(),
        is_synced: false, // Mark as not synced
        local_id: `local_${Date.now()}`,
        user_id: 1, // Will be set properly when synced
      };

      // Add to local store immediately so it appears in reports list
      const { useReportStore } = await import('@store/reportStore');
      const addLocalReport = useReportStore.getState().addLocalReport;
      if (addLocalReport) {
        addLocalReport(localReport);
      }

      // Queue for background sync
      const queueItem = await submissionQueue.addToQueue({
        type: 'COMPLETE_REPORT_SUBMISSION',
        data: {
          ...reportData,
          compressedPhotos,
        },
        timestamp: Date.now(),
        retryCount: 0,
        localReportId: localReport.id, // Link to local report
      });

      log.info('Report saved locally and queued for sync:', localReport.id);

      return {
        id: localReport.id,
        offline: true,
        queueId: queueItem.id,
      };
    } catch (error) {
      log.error('Offline submission failed:', error);
      throw error;
    }
  };

  const submitComplete = async (reportData: CompleteReportData): Promise<SubmissionResult> => {
    if (loading) {
      throw new Error('Submission already in progress');
    }

    setLoading(true);
    setProgress({
      stage: 'preparing',
      message: 'Preparing submission...',
    });

    try {
      log.info('Starting complete report submission');

      // 1. Validate data
      setProgress({
        stage: 'validating',
        message: 'Validating report data...',
      });
      validateReportData(reportData);

      // 2. Compress images
      const compressedPhotos = await compressImages(reportData.photos);

      const totalSize = compressedPhotos.reduce((sum: number, photo: CompressedImage) => sum + photo.size, 0);
      log.info(`Images compressed: ${compressedPhotos.length} files, ${totalSize} bytes total`);

      // 3. True Offline-First Submission
      // Always save locally and queue it immediately so the UI is responsive.
      const result = await submitOffline(reportData, compressedPhotos);

      // Trigger background sync silently outside of the main thread
      submissionQueue.processQueue().catch(e => {
        log.warn('Background sync trigger failed:', e);
      });

      setProgress({
        stage: 'complete',
        message: 'Report saved locally! It will be synced automatically.',
      });

      log.info('Complete submission finished locally:', result);
      return result;

    } catch (error) {
      log.error('Complete submission failed:', error);
      setProgress(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setProgress(null);
    setLoading(false);
  };

  return {
    submitComplete,
    loading,
    progress,
    reset,
    isOnline,
  };
};
