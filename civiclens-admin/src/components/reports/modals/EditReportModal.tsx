"use client";

import React, { useState, useEffect } from 'react';
import { Report, ReportSeverity, Media } from '@/types';
import { reportsApi } from '@/lib/api/reports';
import { mediaApi } from '@/lib/api/media';
import { MediaGallery } from '@/components/reports/manage/MediaGallery';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SimpleSelect } from '@/components/ui/select';
import { X, AlertCircle } from 'lucide-react';

interface EditReportModalProps {
  report: Report;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditReportModal({ report, onClose, onSuccess }: EditReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: report.title,
    description: report.description,
    category: report.category || '',
    sub_category: report.sub_category || '',
  });
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const files = await mediaApi.getReportMedia(report.id);
        // Map API response to Media type expected by gallery
        const mappedMedia = files.map((f: any) => ({
          ...f,
          file_type: f.file_type?.toUpperCase(),
          uploaded_at: f.created_at || f.uploaded_at || new Date().toISOString(),
          caption: f.description || f.caption
        })) as Media[];
        setMedia(mappedMedia);
      } catch (e) {
        console.error('Failed to load media', e);
      }
    };
    loadMedia();
  }, [report.id]);

  // Validation constants
  const TITLE_MIN_LENGTH = 5;
  const TITLE_MAX_LENGTH = 255;
  const DESCRIPTION_MIN_LENGTH = 10;
  const DESCRIPTION_MAX_LENGTH = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || formData.title.trim().length < TITLE_MIN_LENGTH) {
      setError(`Title must be at least ${TITLE_MIN_LENGTH} characters`);
      return;
    }
    if (formData.title.length > TITLE_MAX_LENGTH) {
      setError(`Title must not exceed ${TITLE_MAX_LENGTH} characters`);
      return;
    }
    if (!formData.description || formData.description.trim().length < DESCRIPTION_MIN_LENGTH) {
      setError(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
      return;
    }
    if (formData.description.length > DESCRIPTION_MAX_LENGTH) {
      setError(`Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters`);
      return;
    }

    try {
      setLoading(true);
      await reportsApi.updateReport(report.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category || null,
        sub_category: formData.sub_category || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Report Details
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-7">{report.report_number || `CL-${report.id}`}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pb-0">
          <MediaGallery report={report} media={media} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={`Brief title (${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters)`}
            required
            minLength={TITLE_MIN_LENGTH}
            maxLength={TITLE_MAX_LENGTH}
            helperText={`${formData.title.length}/${TITLE_MAX_LENGTH} characters`}
            className={formData.title.length >= TITLE_MAX_LENGTH ? 'border-orange-500' : ''}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={`Detailed description (${DESCRIPTION_MIN_LENGTH}-${DESCRIPTION_MAX_LENGTH} characters)`}
            required
            minLength={DESCRIPTION_MIN_LENGTH}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={5}
            helperText={`${formData.description.length}/${DESCRIPTION_MAX_LENGTH} characters`}
            className={formData.description.length >= DESCRIPTION_MAX_LENGTH ? 'border-orange-500' : ''}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <SimpleSelect
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Select category"
              >
                <option value="roads">Roads</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation / Garbage</option>
                <option value="streetlight">Street Lights</option>
                <option value="drainage">Drainage</option>
                <option value="public_property">Public Property</option>
                <option value="other">Other</option>
              </SimpleSelect>
            </div>

            <Input
              label="Sub-Category"
              value={formData.sub_category}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
