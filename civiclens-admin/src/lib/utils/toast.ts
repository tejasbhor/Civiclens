import toast from 'react-hot-toast';

/**
 * Centralized toast notification utility  
 * Provides consistent styling and behavior across the app
 */

export const showToast = {
    /**
     * Success toast with optional action
     */
    success: (message: string, options?: {
        description?: string;
        duration?: number;
    }) => {
        const fullMessage = options?.description
            ? `${message}\n${options.description}`
            : message;

        toast.success(fullMessage, {
            duration: options?.duration || 4000,
            icon: '✅',
            style: {
                whiteSpace: 'pre-line',
            }
        });
    },

    /**
     * Error toast
     */
    error: (message: string, options?: {
        description?: string;
        duration?: number;
    }) => {
        const fullMessage = options?.description
            ? `${message}\n${options.description}`
            : message;

        toast.error(fullMessage, {
            duration: options?.duration || 5000,
            icon: '❌',
            style: {
                whiteSpace: 'pre-line',
            }
        });
    },

    /**
     * Warning toast
     */
    warning: (message: string, options?: {
        description?: string;
        duration?: number;
    }) => {
        const fullMessage = options?.description
            ? `${message}\n${options.description}`
            : message;

        toast(fullMessage, {
            duration: options?.duration || 4000,
            icon: '⚠️',
            style: {
                whiteSpace: 'pre-line',
            }
        });
    },

    /**
     * Info toast
     */
    info: (message: string, options?: {
        description?: string;
        duration?: number;
    }) => {
        const fullMessage = options?.description
            ? `${message}\n${options.description}`
            : message;

        toast(fullMessage, {
            duration: options?.duration || 4000,
            icon: 'ℹ️',
            style: {
                whiteSpace: 'pre-line',
            }
        });
    },

    /**
     * Loading toast (returns ID for dismissal)
     */
    loading: (message: string): string => {
        return toast.loading(message);
    },

    /**
     * Dismiss a specific toast
     */
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },

    /**
     * Promise toast - automatically handles loading/success/error states
     */
    promise: async <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(promise, messages);
    },
};

/**
 * Simple confirmation using window.confirm
 */
export const confirmAction = (message: string): boolean => {
    return window.confirm(message);
};
