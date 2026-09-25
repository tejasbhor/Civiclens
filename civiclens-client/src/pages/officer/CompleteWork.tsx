import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Camera, Upload, CheckCircle2, ArrowLeftRight, Loader2,
  X, AlertCircle, FileText, Clock, AlertTriangle, Image as ImageIcon,
  Trash2, Info, CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { officerService } from "@/services/officerService";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import apiClient from "@/services/apiClient";
import { getMediaUrl } from "@/lib/mediaUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
}

const CompleteWork = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isBackendReachable } = useConnectionStatus();

  const [task, setTask] = useState<any>(null);
  const [beforePhotos, setBeforePhotos] = useState<any[]>([]);
  const [citizenPhotos, setCitizenPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [completionNotes, setCompletionNotes] = useState("");
  const [workDuration, setWorkDuration] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [afterPhotos, setAfterPhotos] = useState<PhotoPreview[]>([]);
  const [checklist, setChecklist] = useState({
    resolved: false,
    cleaned: false,
    photos: false,
    materials: false
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Extract error message helper
  const extractErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        return detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', ');
      }
      if (typeof detail === 'object') {
        return detail.msg || detail.message || JSON.stringify(detail);
      }
      return detail;
    }
    if (error?.message) return error.message;
    if (error?.isNetworkError || error?.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }, []);

  const loadTaskAndPhotos = useCallback(async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      setError(null);
      logger.debug(`Loading task details for report ID: ${id}`);

      // Load task details and media in parallel
      const [taskData, mediaData] = await Promise.allSettled([
        officerService.getTaskDetails(parseInt(id)),
        apiClient.get(`/media/report/${id}`)
      ]);

      // Handle task data
      if (taskData.status === 'fulfilled') {
        logger.debug('Task data loaded:', taskData.value);
        setTask(taskData.value);
      } else {
        logger.error('Failed to load task:', taskData.reason);
        const errorMsg = extractErrorMessage(taskData.reason);
        setError(errorMsg);
        toast({
          title: "Failed to Load Task",
          description: errorMsg,
          variant: "destructive"
        });
      }

      // Handle media data
      if (mediaData.status === 'fulfilled') {
        const mediaList = Array.isArray(mediaData.value.data)
          ? mediaData.value.data
          : Array.isArray(mediaData.value)
            ? mediaData.value
            : [];

        const before = mediaList.filter((m: any) => m.upload_source === 'officer_before_photo');
        const citizen = mediaList.filter((m: any) =>
          !m.upload_source || m.upload_source === 'citizen_submission'
        );

        setBeforePhotos(before);
        setCitizenPhotos(citizen);
        logger.debug(`Loaded ${before.length} before photos, ${citizen.length} citizen photos`);
      } else {
        logger.warn('Failed to load media:', mediaData.reason);
        // Continue without media
      }
    } catch (err: any) {
      logger.error('Failed to load task:', err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, user, extractErrorMessage, toast]);

  useEffect(() => {
    if (id && user && !authLoading) {
      loadTaskAndPhotos();
    }
  }, [id, user, authLoading, loadTaskAndPhotos]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/officer/login', { replace: true });
    }
  }, [authLoading, user, navigate]);



  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPEG, PNG, or WebP images.",
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(f => f.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Each photo must be less than 10MB. Please compress or resize your images.",
        variant: "destructive"
      });
      return;
    }

    const totalOfficerPhotos = beforePhotos.length + afterPhotos.length + files.length;

    // Backend limit is 5 officer photos (before + after combined)
    if (totalOfficerPhotos > 5) {
      const remaining = 5 - beforePhotos.length - afterPhotos.length;
      toast({
        title: "Photo Limit Reached",
        description: `Maximum 5 officer photos allowed (before + after combined). You can add ${remaining} more after photo${remaining !== 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return;
    }

    // Create preview objects
    const newPhotos: PhotoPreview[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random()}`
    }));

    setAfterPhotos(prev => [...prev, ...newPhotos]);
    setChecklist(prev => ({ ...prev, photos: true }));
    setValidationErrors(prev => ({ ...prev, photos: '' }));
  }, [beforePhotos.length, afterPhotos.length, toast]);

  const removePhoto = useCallback((photoId: string) => {
    setAfterPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });

    if (afterPhotos.length === 1) {
      setChecklist(prev => ({ ...prev, photos: false }));
    }
  }, [afterPhotos.length]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      afterPhotos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (afterPhotos.length === 0) {
      errors.photos = 'At least one after photo is required';
    }

    if (!completionNotes.trim()) {
      errors.completionNotes = 'Work completion notes are required';
    } else if (completionNotes.trim().length < 10) {
      errors.completionNotes = 'Completion notes must be at least 10 characters';
    }

    if (!workDuration.trim()) {
      errors.workDuration = 'Work duration is required';
    } else {
      const duration = parseFloat(workDuration);
      if (isNaN(duration) || duration <= 0) {
        errors.workDuration = 'Please enter a valid work duration (hours)';
      } else if (duration > 1000) {
        errors.workDuration = 'Work duration seems unrealistic. Please verify.';
      }
    }

    if (!checklist.resolved) {
      errors.checklist = 'Please confirm that the issue is completely resolved';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [afterPhotos.length, completionNotes, workDuration, checklist.resolved]);

  const handleCompleteClick = useCallback(() => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowConfirmDialog(true);
  }, [validateForm, validationErrors]);

  const handleComplete = async () => {
    setShowConfirmDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      logger.debug(`Submitting work for verification, report ID: ${id}`);

      // 1. Upload after photos
      const uploadPromises = afterPhotos.map(async (photoPreview) => {
        const formData = new FormData();
        formData.append('file', photoPreview.file);
        formData.append('upload_source', 'officer_after_photo');
        formData.append('is_proof_of_work', 'true');
        formData.append('caption', 'After completing work');

        return apiClient.post(`/media/upload/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      });

      // Use allSettled to allow partial success
      const results = await Promise.allSettled(uploadPromises);

      // Count successful uploads
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;

      // If all failed, throw error
      if (successCount === 0 && failedCount > 0) {
        const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
        throw firstError.reason;
      }

      // Log partial failures but continue
      if (failedCount > 0) {
        logger.warn(`${failedCount} photo(s) failed to upload, but ${successCount} succeeded`);
        toast({
          title: "Partial Upload Success",
          description: `${successCount} photo(s) uploaded successfully. ${failedCount} photo(s) failed to upload.`,
          variant: "default"
        });
      }

      // 2. Submit for verification
      const submitFormData = new FormData();
      const notes = `${completionNotes.trim()}\n\nWork Duration: ${workDuration} hours\nMaterials Used: ${materialsUsed.trim() || 'N/A'}`;
      submitFormData.append('resolution_notes', notes);

      await apiClient.post(`/reports/${id}/submit-for-verification`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      logger.debug('Work submitted successfully');

      toast({
        title: "Work Completed Successfully",
        description: successCount > 0
          ? `Successfully uploaded ${successCount} after photo(s) and submitted for verification.`
          : "Submitted for verification.",
      });

      // Navigate back to task detail page
      navigate(`/officer/task/${id}`);
    } catch (error: any) {
      logger.error('Failed to complete work:', error);
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate remaining photo slots
  const remainingPhotoSlots = useMemo(() => {
    return Math.max(0, 5 - beforePhotos.length - afterPhotos.length);
  }, [beforePhotos.length, afterPhotos.length]);

  if (loading && !task) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-dvh bg-background">
        <OfficerHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Task</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={loadTaskAndPhotos}>
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/officer/tasks')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tasks
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
      <OfficerHeader />

      {/* Connection Status Banner */}
      {!isBackendReachable && (
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2.5">
          <div className="container mx-auto flex items-center gap-2 text-xs font-mono text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Telemetry Offline: Local changes queued. Connection with dispatch will resume automatically.</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/officer/task/${id}`)}
              aria-label="Back to Task Details"
              className="rounded-full w-10 h-10 border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.92] transition-transform shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Submit Work for Verification</h1>
                {task.report_number && (
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border-slate-200">
                    {task.report_number}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Complete post-resolution checklist and upload proof of work for administrative review
              </p>
            </div>
          </div>
        </div>

        {/* Task Summary Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-slate-950 mb-1.5">{task.title}</h2>
              <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{task.description}</p>
              {task.address && (
                <div className="flex items-center gap-1.5 mt-2.5 text-xs font-mono text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="truncate">{task.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-rose-950 mb-1">Submission Error</h3>
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleCompleteClick(); }}>
          <div className="space-y-8">
            {/* Citizen Photos Reference */}
            {citizenPhotos.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-700" />
                    <h3 className="font-display text-lg font-bold text-slate-950">Citizen Submission Reference</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border-blue-200/60">
                    Baseline
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Review the original photos submitted by the resident to ensure your intervention fully resolves the reported condition.
                </p>
                <div className="grid grid-cols-3 gap-3.5">
                  {citizenPhotos.slice(0, 3).map((photo: any, index: number) => {
                    const mediaUrl = getMediaUrl(photo.file_url || photo.url);
                    return (
                      <div
                        key={photo.id || index}
                        className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs"
                      >
                        <img
                          src={mediaUrl}
                          alt={`Citizen photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {citizenPhotos.length > 3 && (
                  <p className="text-xs font-mono text-slate-400 mt-2.5">
                    + {citizenPhotos.length - 3} more photos on record
                  </p>
                )}
              </div>
            )}

            {/* Before Photos Reference */}
            {beforePhotos.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <h3 className="font-display text-lg font-bold text-slate-950">Pre-Work Inspection Photos</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border-amber-200/60">
                    {beforePhotos.length} on file
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Photographs captured at start of shift before physical work commenced.
                </p>
                <div className="grid grid-cols-3 gap-3.5">
                  {beforePhotos.map((photo: any, index: number) => {
                    const mediaUrl = getMediaUrl(photo.file_url || photo.url);
                    return (
                      <div
                        key={photo.id || index}
                        className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs"
                      >
                        <img
                          src={mediaUrl}
                          alt={`Before photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* After Photos Section */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label className="font-display text-lg font-bold text-slate-950">Proof of Resolution Photos *</Label>
                  {validationErrors.photos && (
                    <Badge variant="destructive" className="font-mono text-xs">
                      {validationErrors.photos}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {afterPhotos.length + beforePhotos.length}/5 photos
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Upload clear post-resolution images proving work has been completed in full compliance. {remainingPhotoSlots > 0
                  ? `You may upload ${remainingPhotoSlots} more image${remainingPhotoSlots !== 1 ? 's' : ''}.`
                  : 'Maximum photo allocation reached.'}
              </p>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-11 active:scale-[0.98] transition-all"
                    asChild
                    disabled={remainingPhotoSlots === 0}
                  >
                    <label className="cursor-pointer flex items-center justify-center">
                      <Camera className="w-4 h-4 mr-2 text-emerald-800" />
                      Take Live Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={remainingPhotoSlots === 0}
                      />
                    </label>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-11 active:scale-[0.98] transition-all"
                    asChild
                    disabled={remainingPhotoSlots === 0}
                  >
                    <label className="cursor-pointer flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2 text-emerald-800" />
                      Upload from Device
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={remainingPhotoSlots === 0}
                      />
                    </label>
                  </Button>
                </div>

                {afterPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3.5 pt-2">
                    {afterPhotos.map((photoPreview) => (
                      <div
                        key={photoPreview.id}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-xs"
                      >
                        <img
                          src={photoPreview.preview}
                          alt="After work"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photoPreview.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-600 active:scale-95"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-emerald-700/90 backdrop-blur-sm text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">After</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {afterPhotos.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      No after photos uploaded yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload at least one resolution photo showing the repaired location.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Before/After Comparison */}
            {afterPhotos.length > 0 && beforePhotos.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold font-display tracking-tight text-slate-950">
                    Before / After Field Comparison
                  </h3>
                </div>
                <div className="space-y-4">
                  {beforePhotos.slice(0, Math.min(beforePhotos.length, afterPhotos.length)).map((beforePhoto, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200/60 text-xs font-mono">Before</Badge>
                          <span className="text-xs font-mono text-slate-400">Photo {idx + 1}</span>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-amber-200/80 shadow-xs">
                          <img
                            src={getMediaUrl(beforePhoto.file_url || beforePhoto.url)}
                            alt={`Before ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200/60 text-xs font-mono">After</Badge>
                          <span className="text-xs font-mono text-slate-400">Photo {idx + 1}</span>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-emerald-200/80 shadow-xs">
                          <img
                            src={afterPhotos[idx]?.preview || ''}
                            alt={`After ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Notes */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="completionNotes" className="text-base font-bold font-display tracking-tight text-slate-950">
                  Work Completion Notes *
                </Label>
                {validationErrors.completionNotes && (
                  <Badge variant="destructive" className="text-xs font-mono">
                    {validationErrors.completionNotes}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-3 font-sans">
                Provide a detailed technical description of work completed, remedies applied, and current condition.
              </p>
              <Textarea
                id="completionNotes"
                placeholder="Example: Water logging cleared completely. Installed new drainage grill. Area cleaned and restored to normal condition. All debris removed..."
                value={completionNotes}
                onChange={(e) => {
                  setCompletionNotes(e.target.value);
                  setValidationErrors(prev => ({ ...prev, completionNotes: '' }));
                }}
                className={`min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 ${validationErrors.completionNotes ? 'border-red-500' : ''}`}
                aria-invalid={!!validationErrors.completionNotes}
                aria-describedby={validationErrors.completionNotes ? 'completionNotes-error' : undefined}
              />
              <p className="text-xs font-mono text-slate-400 mt-1">
                {completionNotes.length}/500 characters (minimum 10 characters required)
              </p>
            </div>

            {/* Work Duration & Materials */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="workDuration" className="text-base font-bold font-display tracking-tight text-slate-950">
                    Actual Duration *
                  </Label>
                  {validationErrors.workDuration && (
                    <Badge variant="destructive" className="text-xs font-mono">
                      {validationErrors.workDuration}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Total field hours spent (e.g. 2.5 for 2 hrs 30 mins).
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    id="workDuration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="1000"
                    placeholder="2.5"
                    value={workDuration}
                    onChange={(e) => {
                      setWorkDuration(e.target.value);
                      setValidationErrors(prev => ({ ...prev, workDuration: '' }));
                    }}
                    className={`max-w-[160px] font-mono rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white ${validationErrors.workDuration ? 'border-red-500' : ''}`}
                    aria-invalid={!!validationErrors.workDuration}
                    aria-describedby={validationErrors.workDuration ? 'workDuration-error' : undefined}
                  />
                  <span className="text-sm font-medium text-slate-500">hours</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <Label htmlFor="materialsUsed" className="text-base font-bold font-display tracking-tight text-slate-950 mb-2 block">
                  Materials Used (Optional)
                </Label>
                <p className="text-xs text-slate-500 mb-3">
                  List municipal tools, equipment, aggregate, or replacement parts used.
                </p>
                <Input
                  id="materialsUsed"
                  placeholder="e.g., Cold asphalt mix, compactor, drainage grill..."
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="max-w-full rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-base font-bold font-display tracking-tight text-slate-950">Completion Checklist *</Label>
                {validationErrors.checklist && (
                  <Badge variant="destructive" className="text-xs font-mono">
                    {validationErrors.checklist}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Confirm all operational and verification criteria prior to dispatching for audit approval.
              </p>
              <div className="space-y-3">
                <div className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${checklist.resolved ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50/60 border-slate-200/60'}`}>
                  <Checkbox
                    id="resolved"
                    checked={checklist.resolved}
                    onCheckedChange={(checked) => {
                      setChecklist(prev => ({ ...prev, resolved: checked as boolean }));
                      setValidationErrors(prev => ({ ...prev, checklist: '' }));
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="resolved"
                      className="text-sm font-semibold text-slate-900 leading-tight cursor-pointer"
                    >
                      Issue completely resolved
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      The reported municipal defect has been thoroughly addressed according to city standards.
                    </p>
                  </div>
                  {checklist.resolved && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>

                <div className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${checklist.cleaned ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50/60 border-slate-200/60'}`}>
                  <Checkbox
                    id="cleaned"
                    checked={checklist.cleaned}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, cleaned: checked as boolean }))
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="cleaned"
                      className="text-sm font-semibold text-slate-900 leading-tight cursor-pointer"
                    >
                      Area cleaned and restored
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Surrounding pedestrian walkways and roadways cleared of debris and hazardous materials.
                    </p>
                  </div>
                  {checklist.cleaned && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>

                <div className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${checklist.photos ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50/60 border-slate-200/60'}`}>
                  <Checkbox
                    id="photos"
                    checked={checklist.photos}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, photos: checked as boolean }))
                    }
                    className="mt-0.5"
                    disabled={afterPhotos.length > 0}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="photos"
                      className={`text-sm font-semibold text-slate-900 leading-tight ${afterPhotos.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                    >
                      Post-resolution photographic evidence captured
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      {afterPhotos.length > 0
                        ? `${afterPhotos.length} high-resolution after photo${afterPhotos.length !== 1 ? 's' : ''} uploaded.`
                        : 'Upload at least one resolution photo to complete this task.'}
                    </p>
                  </div>
                  {checklist.photos && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>

                <div className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${checklist.materials ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50/60 border-slate-200/60'}`}>
                  <Checkbox
                    id="materials"
                    checked={checklist.materials}
                    onCheckedChange={(checked) =>
                      setChecklist(prev => ({ ...prev, materials: checked as boolean }))
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="materials"
                      className="text-sm font-semibold text-slate-900 leading-tight cursor-pointer"
                    >
                      All equipment and waste accounted for
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Municipal tools retrieved, traffic cones removed, and disposal regulations observed.
                    </p>
                  </div>
                  {checklist.materials && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-5 flex items-start gap-3.5">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm font-display text-blue-950 mb-1">What happens next?</h4>
                <p className="text-xs text-blue-900/80 leading-relaxed font-sans">
                  Upon submission, this resolution package will be routed to the municipal verification desk for audit. 
                  The reporting citizen will receive a real-time notification with before/after evidence, and status will update automatically.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 h-12 font-medium px-6 active:scale-[0.98] transition-all"
                onClick={() => navigate(`/officer/task/${id}`)}
                disabled={submitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel Operation
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold h-12 active:scale-[0.98] transition-all shadow-xs inline-flex items-center justify-center gap-2"
                disabled={submitting || !isBackendReachable}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Verification Package...
                  </>
                ) : (
                  <>
                    <span>Submit for Administrative Verification</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold font-display tracking-tight text-slate-950">
                Submit Work for Verification?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2 text-slate-600 font-sans">
                <p>
                  You are finalizing field execution and submitting this case for administrative sign-off.
                </p>
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5 text-xs font-mono">
                  <p className="font-semibold text-slate-900">Summary Review:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>{afterPhotos.length} post-repair photo{afterPhotos.length !== 1 ? 's' : ''} attached</li>
                    <li>Operational duration logged: {workDuration} hours</li>
                    <li>Status transition: Active Operations → Pending Verification</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500">
                  The citizen reporter and municipal audit desk will receive this submission package. Confirm that work is complete.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0 pt-4">
              <AlertDialogCancel 
                disabled={submitting}
                className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-5"
              >
                Review Again
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleComplete} 
                disabled={submitting}
                className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold px-6 shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Confirm & Submit'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CompleteWork;
