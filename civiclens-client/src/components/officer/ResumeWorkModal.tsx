import React, { useState } from 'react';
import { X, Play, CheckCircle } from 'lucide-react';
import { officerService } from '../../services/officerService';
import { useToast } from '../../hooks/use-toast';

interface ResumeWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number;
  reportNumber?: string;
  holdReason?: string;
  onSuccess?: () => void;
}

export const ResumeWorkModal: React.FC<ResumeWorkModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportNumber,
  holdReason,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await officerService.resumeWork(reportId, notes.trim() || undefined);
      
      toast({
        title: 'Success',
        description: 'Work resumed successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
      // Reset form
      setNotes('');
    } catch (error: any) {
      console.error('Error resuming work:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to resume work',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-dvh items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-6 h-6 text-success" />
              <h2 className="text-xl font-semibold text-foreground">
                Resume Work
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-muted-foreground disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Report Info */}
          {reportNumber && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Report: <span className="font-medium text-foreground">{reportNumber}</span>
              </p>
            </div>
          )}

          {/* Hold Reason Display */}
          {holdReason && (
            <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-sm font-medium text-warning mb-1">
                Previous Hold Reason:
              </p>
              <p className="text-sm text-warning">
                {holdReason}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Notes Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-info focus:border-transparent disabled:bg-muted"
                placeholder="Add any notes about resuming work (e.g., issue resolved, materials received, etc.)"
              />
            </div>

            {/* Success Message */}
            <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-success">
                    Ready to Resume
                  </p>
                  <p className="text-sm text-success mt-1">
                    The task will be marked as IN_PROGRESS and you can continue working on it.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Resuming...'
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Work
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
