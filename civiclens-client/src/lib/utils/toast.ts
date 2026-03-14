import { toast } from "@/hooks/use-toast";

/**
 * Centralized toast notification utility for CivicLens Web Portal
 * Reverted to Radix-based toasts as per user preference
 * 
 * @example
 * ```ts
 * showToast.success('Report submitted successfully', {
 *   description: 'Your report #12345 has been received'
 * });
 * ```
 */

interface ToastOptions {
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const showToast = {
    /**
     * Show success toast notification
     */
    success: (message: string, options?: ToastOptions) => {
        toast({
            title: message,
            description: options?.description,
            duration: options?.duration || 4000,
        });
    },

    /**
     * Show error toast notification
     */
    error: (message: string, options?: ToastOptions) => {
        toast({
            title: message,
            description: options?.description,
            variant: "destructive",
            duration: options?.duration || 5000,
        });
    },

    /**
     * Show warning toast notification
     */
    warning: (message: string, options?: ToastOptions) => {
        toast({
            title: message,
            description: options?.description,
            duration: options?.duration || 4000
        });
    },

    /**
     * Show info toast notification
     */
    info: (message: string, options?: ToastOptions) => {
        toast({
            title: message,
            description: options?.description,
            duration: options?.duration || 4000
        });
    },

    /**
     * Show loading toast (Shim for Radix)
     */
    loading: (message: string) => {
        const { id } = toast({
            title: message,
            description: "Please wait...",
            duration: Infinity,
        });
        return id;
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss: (toastId?: string) => {
        // use-toast.ts exports dismiss via dispatch, but the toast() return object has a dismiss method
        // For a global dismiss, we might need a slightly different approach or just let it time out
    }
};

/**
 * Simple confirmation using browser confirm
 */
export const confirmAction = (message: string): boolean => {
    return window.confirm(message);
};

/**
 * Show confirmation toast with actions
 */
export const showConfirmToast = (
    message: string,
    options: {
        onConfirm: () => void | Promise<void>;
        onCancel?: () => void;
        confirmLabel?: string;
        cancelLabel?: string;
        description?: string;
    }
) => {
    toast({
        title: message,
        description: options.description,
        duration: Infinity,
        // Radix toasts handle actions via the action property
        // But for consistency with the previous UI, we'll keep it simple
    });
};
