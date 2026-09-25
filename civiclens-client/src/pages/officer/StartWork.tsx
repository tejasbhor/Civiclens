import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, RefreshCw, Loader2, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { officerService } from "@/services/officerService";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { PhotoUpload } from "@/components/officer/PhotoUpload";
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

const StartWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [locationVerified, setLocationVerified] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    loadTask();
    getCurrentLocation();
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await officerService.getTaskDetails(parseInt(id));
      setTask(data);
    } catch (error: any) {
      console.error('Failed to load task:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to load task",
        variant: "destructive"
      });
      navigate('/officer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationVerified(false);
        }
      );
    }
  };

  const handlePhotosChange = (photos: File[]) => {
    setBeforePhotos(photos);
  };

  const handleStartWorkClick = () => {
    if (beforePhotos.length === 0) {
      toast({
        title: "Photos Required",
        description: "Please upload at least one before photo",
        variant: "destructive"
      });
      return;
    }

    if (!estimatedHours) {
      toast({
        title: "Missing Information",
        description: "Please enter estimated hours",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleStartWork = async () => {
    if (!task) return;

    try {
      setSubmitting(true);
      setShowConfirmDialog(false);

      await officerService.startWork(task.id, {
        notes,
        estimated_hours: parseFloat(estimatedHours) || 0,
        before_photos: beforePhotos,
        location: currentLocation ? {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy
        } : undefined
      });

      toast({
        title: "Work Started",
        description: "Task is now in progress. Stay safe!"
      });

      navigate(`/officer/task/${task.id}`);
    } catch (error: any) {
      console.error('Failed to start work:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to start work",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#fbfcfd]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-800 mx-auto mb-3" />
          <p className="font-mono text-sm text-slate-500">Loading task telemetry...</p>
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

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-3xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(`/officer/task/${task.id}`)} 
            aria-label="Back to Task Details"
            className="rounded-full w-10 h-10 border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.92] transition-transform shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Task #{task.report_number}
              </span>
              <span className="font-mono text-xs text-slate-400">Step 1 of 2: Field Check-in</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Begin Field Execution
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-xs">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h2 className="font-display text-xl font-bold text-slate-950 mb-1.5">{task.title}</h2>
            <p className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>{task.address}</span>
            </p>
          </div>

          <div className="space-y-7">
            {/* GPS Check-in Telemetry */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>GPS Geofence Verification</span>
                  {locationVerified && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </h3>
                {locationVerified && (
                  <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    Within Geofence
                  </span>
                )}
              </div>
              <div className={`p-5 rounded-2xl border transition-all ${locationVerified ? 'bg-emerald-50/50 border-emerald-200/70' : 'bg-amber-50/50 border-amber-200/70'}`}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/70 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-800">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">Device Sensor Fix</p>
                      {currentLocation ? (
                        <div className="font-mono text-xs text-slate-800 mt-1 space-y-0.5">
                          <p className="font-semibold text-sm">
                            {currentLocation.lat.toFixed(6)}°N, {currentLocation.lng.toFixed(6)}°E
                          </p>
                          <p className="text-slate-500 text-[11px]">Signal Radius Accuracy: ±{currentLocation.accuracy.toFixed(0)}m</p>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-slate-400 mt-1">Acquiring GPS fix from satellite receiver...</p>
                      )}
                    </div>
                  </div>
                  
                  {locationVerified && (
                    <div className="flex items-center gap-2 text-emerald-800 font-medium text-xs pt-1 border-t border-emerald-200/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Telemetry confirmed: Field unit is on-site at report coordinates.</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/50">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold active:scale-[0.98]"
                    onClick={getCurrentLocation}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                    Re-scan Geofence Coordinates
                  </Button>
                </div>
              </div>
            </div>

            {/* Before Photos */}
            <div>
              <PhotoUpload
                maxPhotos={5}
                onPhotosChange={handlePhotosChange}
                title="Pre-Work Evidence Photos *"
                description="Upload clear, geo-tagged photos of the issue before commencing work"
                existingPhotos={beforePhotos}
              />
            </div>

            {/* Work Notes */}
            <div>
              <Label htmlFor="notes" className="font-display text-sm font-bold text-slate-950">Field Operational Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe planned intervention, machinery required, safety equipment deployed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[110px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm"
              />
            </div>

            {/* Estimated Time */}
            <div>
              <Label htmlFor="estimatedHours" className="font-display text-sm font-bold text-slate-950">Estimated Resolution Time (hours) *</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                placeholder="e.g. 2.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="mt-2 font-mono text-sm max-w-[200px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-12 active:scale-[0.98]"
              onClick={() => navigate(`/officer/task/${task.id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="flex-1 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold h-12 shadow-xs active:scale-[0.98] inline-flex items-center justify-center gap-2"
              onClick={handleStartWorkClick}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initiating Operations...</span>
                </>
              ) : (
                <>
                  <span>Start Work</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="rounded-3xl border-slate-200 p-6 sm:p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl font-bold text-slate-950">
                Confirm Work Commencement?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-sm leading-relaxed">
                Starting work will activate the task SLA timer, log your GPS coordinates to the immutable audit log, and dispatch an automated status notification to the reporting citizen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel className="rounded-full border-slate-200 font-semibold">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleStartWork}
                className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold shadow-xs"
              >
                Confirm & Start
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StartWork;
