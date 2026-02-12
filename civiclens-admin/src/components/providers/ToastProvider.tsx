'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * Place this in your root layout to enable toasts throughout the app
 */
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#363636',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '16px',
                    fontSize: '14px',
                },
                // Success
                success: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                // Error
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
                // Loading
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
