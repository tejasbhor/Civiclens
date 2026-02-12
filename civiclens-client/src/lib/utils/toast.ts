import { toast } from 'sonner';

/**
 * Centralized toast notification utility for CivicLens Citizen Portal
 * Uses sonner for consistent, modern toast notifications
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
        toast.success(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        });
    },

    /**
     * Show error toast notification
     */
    error: (message: string, options?: ToastOptions) => {
        toast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        });
    },

    /**
     * Show warning toast notification
     */
    warning: (message: string, options?: ToastOptions) => {
        toast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000
        });
    },

    /**
     * Show info toast notification
     */
    info: (message: string, options?: ToastOptions) => {
        toast.info(message, {
            description: options?.description,
            duration: options?.duration || 4000
        });
    },

    /**
     * Show loading toast (returns ID for dismissal)
     */
    loading: (message: string): string | number => {
        return toast.loading(message);
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss: (toastId?: string | number) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    },

    /**
     * Show promise toast - automatically handles loading/success/error states
     */
    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(promise, messages);
    }
};

/**
 * Simple confirmation using browser confirm
 * Can be enhanced with a custom modal later
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
    toast(message, {
        description: options.description,
        duration: Infinity,
        action: {
            label: options.confirmLabel || 'Confirm',
            onClick: async () => {
                await options.onConfirm();
            }
        },
        cancel: {
            label: options.cancelLabel || 'Cancel',
            onClick: () => {
                if (options.onCancel) {
                    options.onCancel();
                }
            }
        }
    });
};
