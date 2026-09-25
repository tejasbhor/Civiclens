import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, X, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { reportsService } from "@/services/reportsService";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { logger } from "@/lib/logger";
import apiClient from "@/services/apiClient";
import { APP_CONFIG } from "@/config/appConfig";

interface FormData {
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  landmark: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 10;

const SubmitReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, isOffline } = useAuth();
  const { isBackendReachable } = useConnectionStatus();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    severity: "medium",
    landmark: ""
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  // Helper to extract error message from various error formats
  const extractErrorMessage = useCallback((err: any): string => {
    // Handle Pydantic validation errors (array of errors)
    if (Array.isArray(err.response?.data?.detail)) {
      const firstError = err.response.data.detail[0];
      if (typeof firstError === 'object' && firstError.msg) {
        return firstError.msg || 'Validation error occurred';
      }
      return err.response.data.detail[0]?.msg || 'Validation error occurred';
    }

    // Handle single validation error object
    if (err.response?.data?.detail && typeof err.response.data.detail === 'object') {
      if (err.response.data.detail.msg) {
        return err.response.data.detail.msg;
      }
      if (err.response.data.detail.message) {
        return err.response.data.detail.message;
      }
      return 'An error occurred. Please check your input and try again.';
    }

    // Handle string error messages
    if (typeof err.response?.data?.detail === 'string') {
      return err.response.data.detail;
    }

    // Handle network errors
    if (!err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Handle error message
    if (typeof err.message === 'string') {
      return err.message;
    }

    // Fallback
    return 'An error occurred. Please try again.';
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/citizen/login');
    }
  }, [authLoading, user, navigate]);

  // Reverse geocode using OpenStreetMap Nominatim API with high accuracy
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<{ address: string; landmark: string }> => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for better accuracy

      // Use higher zoom level (18-19) for more detailed address
      // Also try with addressdetails=1 for full address components
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': `${APP_CONFIG.appName}/1.0`
          },
          signal: controller.signal
        }
      );

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      // Extract address components with priority order for accuracy
      const addr = data.address || {};

      // Build comprehensive address with all available components
      const addressComponents = [
        addr.house_number,
        addr.house_name,
        addr.road || addr.street || addr.pedestrian,
        addr.neighbourhood || addr.suburb || addr.village,
        addr.city || addr.town || addr.municipality,
        addr.state || addr.region,
        addr.postcode,
        addr.country
      ].filter(Boolean);

      // Use display_name as primary source (most accurate from OSM)
      const fullAddress = data.display_name || addressComponents.join(', ') || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      // For landmark, use the full address (as requested by user)
      // This provides maximum accuracy and detail
      const landmark = fullAddress;

      return { address: fullAddress, landmark };
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      logger.error('Reverse geocoding error:', error);
      // Fallback to coordinates with high precision
      const coordinateAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      return {
        address: coordinateAddress,
        landmark: coordinateAddress
      };
    }
  }, []);

  // Get current GPS location with high accuracy
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation. Please use a modern browser.",
        variant: "destructive"
      });
      return;
    }

    setLocationLoading(true);

    // Use getCurrentPosition with high accuracy settings
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          // Validate coordinates
          if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            toast({
              title: "Invalid Coordinates",
              description: "The captured coordinates are invalid. Please try again.",
              variant: "destructive"
            });
            setLocationLoading(false);
            return;
          }

          // Show loading message for geocoding
          toast({
            title: "Fetching Address...",
            description: "Getting detailed address information for your location",
          });

          // Reverse geocode to get address and landmark
          const { address, landmark } = await reverseGeocode(latitude, longitude);

          setLocation({ latitude, longitude, address, accuracy });

          // Auto-fill landmark with full address (as requested by user)
          setFormData(prev => ({ ...prev, landmark: address }));

          toast({
            title: "Location Captured Successfully",
            description: `Location captured with accuracy of ±${Math.round(accuracy)}m. Full address has been auto-filled in the landmark field.`,
          });
        } catch (error) {
          logger.error('Location processing error:', error);
          toast({
            title: "Location Error",
            description: "Failed to process location. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please ensure GPS is enabled and try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please ensure you are in an area with good GPS signal and try again.";
            break;
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true, // Request highest accuracy possible
        timeout: 20000, // 20 second timeout to allow GPS to get better accuracy
        maximumAge: 0 // Always get fresh position, don't use cached
      }
    );
  }, [reverseGeocode, toast]);

  // Handle photo selection
  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate count
    if (photos.length + files.length > MAX_PHOTOS) {
      toast({
        title: "Too Many Photos",
        description: `Maximum ${MAX_PHOTOS} photos allowed. You can upload ${MAX_PHOTOS - photos.length} more.`,
        variant: "destructive"
      });
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file types
    const invalidTypes = files.filter(f => !f.type.startsWith('image/'));
    if (invalidTypes.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only image files (JPG, PNG, etc.)",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter(f => f.size > MAX_PHOTO_SIZE);
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      toast({
        title: "File Too Large",
        description: `The following files exceed ${MAX_PHOTO_SIZE / (1024 * 1024)}MB: ${fileNames}`,
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setPhotos(prev => [...prev, ...files]);

    e.target.value = ''; // Reset input for next selection
  }, [photos.length, toast]);

  // Remove photo
  const removePhoto = useCallback((index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  }, [photoPreviewUrls]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (!formData.title || formData.title.trim().length < MIN_TITLE_LENGTH) {
      toast({
        title: "Invalid Title",
        description: `Title must be at least ${MIN_TITLE_LENGTH} characters long`,
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description || formData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      toast({
        title: "Invalid Description",
        description: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long`,
        variant: "destructive"
      });
      return false;
    }

    if (!location) {
      toast({
        title: "Location Required",
        description: "Please capture your current location before submitting the report",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [formData, location, toast]);

  // Upload photos
  const uploadPhotos = useCallback(async (reportId: number): Promise<{ success: number; failed: number }> => {
    if (photos.length === 0) {
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      try {
        const formData = new FormData();
        formData.append('file', photo);
        formData.append('upload_source', 'citizen_submission');
        formData.append('is_proof_of_work', 'false');

        const response = await apiClient.post(
          `/media/upload/${reportId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout per photo
          }
        );

        if (response.status === 200 || response.status === 201) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (uploadError: any) {
        logger.error(`Photo upload error for photo ${i + 1}:`, uploadError);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  }, [photos]);

  // Submit report
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    if (isOffline || !isBackendReachable) {
      toast({
        title: "Connection Error",
        description: "Unable to submit report. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Create report
      const reportData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        address: location!.address,
        severity: formData.severity,
        category: formData.category || undefined,
        landmark: formData.landmark.trim() || undefined,
      };

      const report = await reportsService.createReport(reportData);

      // Upload photos if any
      let photoUploadResult = { success: 0, failed: 0 };
      if (photos.length > 0) {
        photoUploadResult = await uploadPhotos(report.id);
      }

      // Cleanup preview URLs
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));

      // Show success message
      if (photoUploadResult.failed > 0) {
        toast({
          title: "Report Submitted with Warnings",
          description: `Report ${report.report_number} created successfully. ${photoUploadResult.success} photo(s) uploaded, ${photoUploadResult.failed} failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Report Submitted Successfully",
          description: `Report ${report.report_number} has been created successfully.`,
        });
      }

      // Navigate to track page
      navigate(`/citizen/track/${report.id}`);
    } catch (error: any) {
      logger.error('Failed to submit report:', error);

      const errorMessage = extractErrorMessage(error);
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, location, photos, photoPreviewUrls, validateForm, uploadPhotos, extractErrorMessage, toast, navigate, isOffline, isBackendReachable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  // Memoized form validation state
  const isFormValid = useMemo(() => {
    return (
      formData.title.trim().length >= MIN_TITLE_LENGTH &&
      formData.description.trim().length >= MIN_DESCRIPTION_LENGTH &&
      location !== null
    );
  }, [formData, location]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fbfcfd] relative text-slate-900">
      {/* Background radial dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        <CitizenHeader />

        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/citizen/dashboard')}
            className="mb-6 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 -ml-2 gap-1.5 active:scale-[0.98] transition-transform"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>

          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DISPATCH TELEMETRY</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-emerald-700 font-bold">GEOTAGGED REPORT</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              File a Civic Issue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Captured data is cryptographically timestamped and assigned to responsible municipal officers.
            </p>
          </div>

          {/* Main Card Enclosure */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-xs space-y-8">
            {/* Offline Indicator */}
            {isOffline && (
              <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>You are currently offline. Report submission may not be available until reconnected.</span>
              </div>
            )}

            {/* Report Details */}
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold text-slate-950 pb-2 border-b border-slate-100">
                1. Incident Details
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="E.g., Deep pothole near sector 4 crossing…"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-2 rounded-xl border-slate-200/90 bg-white text-sm focus-visible:ring-emerald-500 h-11"
                    maxLength={255}
                    disabled={loading}
                    aria-required="true"
                    aria-describedby="title-hint"
                    aria-invalid={formData.title.length > 0 && formData.title.length < MIN_TITLE_LENGTH}
                  />
                  <p id="title-hint" className="text-xs text-slate-400 mt-1.5 font-mono">
                    {formData.title.length}/255 characters
                    {formData.title.length < MIN_TITLE_LENGTH && formData.title.length > 0 && (
                      <span className="text-amber-600 font-semibold ml-1.5">
                        (min {MIN_TITLE_LENGTH} chars)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide exact details of the road hazard, outage, or sanitation spill…"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2 min-h-[120px] rounded-xl border-slate-200/90 bg-white text-sm focus-visible:ring-emerald-500 leading-relaxed"
                    maxLength={2000}
                    disabled={loading}
                    aria-required="true"
                    aria-describedby="desc-hint"
                    aria-invalid={formData.description.length > 0 && formData.description.length < MIN_DESCRIPTION_LENGTH}
                  />
                  <p id="desc-hint" className="text-xs text-slate-400 mt-1.5 font-mono">
                    {formData.description.length}/2000 characters
                    {formData.description.length < MIN_DESCRIPTION_LENGTH && formData.description.length > 0 && (
                      <span className="text-amber-600 font-semibold ml-1.5">
                        (min {MIN_DESCRIPTION_LENGTH} chars)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Category (Optional)
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-slate-200/90 bg-white text-sm focus-visible:ring-emerald-500 h-11" id="category" aria-label="Select category">
                      <SelectValue placeholder="Select Category (or let AI triage automatically)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="roads">Roads & Potholes</SelectItem>
                      <SelectItem value="water">Water Supply & Leakage</SelectItem>
                      <SelectItem value="sanitation">Sanitation / Garbage Dump</SelectItem>
                      <SelectItem value="electricity">Electricity & Power</SelectItem>
                      <SelectItem value="streetlight">Street Lights & Illumination</SelectItem>
                      <SelectItem value="drainage">Drainage & Sewage</SelectItem>
                      <SelectItem value="public_property">Public Property Damage</SelectItem>
                      <SelectItem value="other">Other Civic Matter</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Leave blank to allow the CivicLens automated triage pipeline to classify your report.
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Severity *</Label>
                  <RadioGroup
                    value={formData.severity}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({ ...formData, severity: value })}
                    className="mt-2"
                    disabled={loading}
                    aria-required="true"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { value: "low", label: "Low", desc: "Non-urgent", color: "peer-checked:border-emerald-500 peer-checked:bg-emerald-50/70" },
                        { value: "medium", label: "Medium", desc: "Routine", color: "peer-checked:border-amber-500 peer-checked:bg-amber-50/70" },
                        { value: "high", label: "High", desc: "Urgent", color: "peer-checked:border-orange-500 peer-checked:bg-orange-50/70" },
                        { value: "critical", label: "Critical", desc: "Hazardous", color: "peer-checked:border-rose-500 peer-checked:bg-rose-50/70" }
                      ].map((item) => (
                        <div key={item.value} className="flex items-center">
                          <RadioGroupItem value={item.value} id={item.value} className="peer sr-only" />
                          <Label
                            htmlFor={item.value}
                            className={`flex-1 p-3 border border-slate-200 rounded-2xl text-center cursor-pointer transition-all ${item.color} hover:bg-slate-50 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed`}
                          >
                            <span className="block font-display text-sm font-bold text-slate-900">{item.label}</span>
                            <span className="block font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{item.desc}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <h2 className="font-display text-lg font-bold text-slate-950 pb-2 border-b border-slate-100">
                2. Geolocation Proof *
              </h2>

              <div className="space-y-4">
                {location ? (
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Captured Coordinates</Label>
                    <div className="mt-2 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm leading-snug">{location.address}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
                            <span className="text-slate-600 font-semibold bg-white/80 px-2 py-0.5 rounded border border-emerald-100">
                              GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </span>
                            <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                              ±{Math.round(location.accuracy)}m accuracy
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full rounded-full border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 h-9"
                      onClick={getCurrentLocation}
                      disabled={locationLoading || loading}
                      aria-label="Update location"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Acquiring Fresh GPS Telemetry...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                          Re-acquire Location
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">GPS Location Required</Label>
                    <div className="mt-2 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">Location Not Yet Attached</p>
                          <p className="text-xs text-slate-600 mt-1">
                            CivicLens requires tamper-resistant GPS coordinates to prevent fraudulent reports and route officers directly.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="mt-3 w-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold rounded-full h-11 shadow-xs active:scale-[0.98]"
                      onClick={getCurrentLocation}
                      disabled={locationLoading || loading}
                      aria-label="Get current location"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Acquiring Satellite Lock...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Capture Current Location
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div>
                  <Label htmlFor="landmark" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Address / Landmark (Auto-filled)
                  </Label>
                  <Input
                    id="landmark"
                    placeholder="Full address will be auto-filled when location is captured"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="mt-2 rounded-xl border-slate-200/90 bg-white text-sm focus-visible:ring-emerald-500 h-11"
                    disabled={loading}
                    maxLength={500}
                    aria-label="Address or landmark, auto-filled from GPS location"
                  />
                  {formData.landmark && (
                    <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Auto-filled from reverse geocoding (editable)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <h2 className="font-display text-lg font-bold text-slate-950 pb-2 border-b border-slate-100">
                3. Photographic Proof (Optional)
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo-upload" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Upload Photos (Max {MAX_PHOTOS}, {MAX_PHOTO_SIZE / (1024 * 1024)}MB each)
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-upload"
                    disabled={loading || photos.length >= MAX_PHOTOS}
                    aria-label="Upload photos"
                  />
                  <label htmlFor="photo-upload" className="block cursor-pointer">
                    <div className="mt-2 w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-emerald-500/50 hover:bg-slate-50/50 transition-all">
                      <Upload className="w-7 h-7 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        {photos.length >= MAX_PHOTOS ? `Maximum ${MAX_PHOTOS} photos reached` : 'Click to Browse Photos'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {photos.length}/{MAX_PHOTOS} photos attached
                      </span>
                    </div>
                  </label>

                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3" role="list" aria-label="Photo previews">
                      {photoPreviewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs" role="listitem">
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-colors"
                            onClick={() => removePhoto(idx)}
                            disabled={loading}
                            aria-label={`Remove photo ${idx + 1}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-100">
              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full h-12 rounded-full font-bold bg-[#0a2e2a] hover:bg-[#072421] text-white shadow-xs active:scale-[0.98] transition-all text-sm tracking-wide"
                disabled={loading || !isFormValid || isOffline || !isBackendReachable}
                aria-label="Submit report"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Verified Incident...
                  </>
                ) : (
                  'Submit Geotagged Report'
                )}
              </Button>
              <p className="text-xs text-slate-400 font-mono text-center mt-3">
                {!location
                  ? "• GPS coordinates required before submission"
                  : !isFormValid
                    ? "• Fill all required fields (title & description)"
                    : isOffline || !isBackendReachable
                      ? "• Offline: reconnect to dispatch"
                      : "• Report will be immediately registered into municipal queue"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;
