import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication screen types with their associated data
 */
export type AuthScreen =
    | { type: 'SELECT_MODE' }
    | { type: 'QUICK_OTP_PHONE' }
    | { type: 'QUICK_OTP_VERIFY'; phone: string }
    | { type: 'REGISTER_FORM' }
    | { type: 'REGISTER_VERIFY'; phone: string; name: string; email?: string }
    | { type: 'PASSWORD_LOGIN' };

/**
 * Custom hook for managing authentication navigation stack
 * 
 * This hook maintains a proper navigation history for the authentication flow,
 * ensuring that back button behavior is consistent and predictable.
 * 
 * @example
 * const { current, push, pop, reset, canGoBack } = useAuthNavigation();
 * 
 * // Navigate to phone entry
 * push({ type: 'QUICK_OTP_PHONE' });
 * 
 * // Go back
 * const previous = pop();
 * 
 * // Reset to initial state
 * reset();
 */
export const useAuthNavigation = () => {
    const navigate = useNavigate();
    const [stack, setStack] = useState<AuthScreen[]>([{ type: 'SELECT_MODE' }]);

    /**
     * Push a new screen onto the navigation stack
     */
    const push = useCallback((screen: AuthScreen) => {
        setStack((prev) => [...prev, screen]);
    }, []);

    /**
     * Pop the current screen and return to the previous one
     * If at the root, navigate back to landing page
     */
    const pop = useCallback(() => {
        if (stack.length > 1) {
            const newStack = stack.slice(0, -1);
            setStack(newStack);
            return newStack[newStack.length - 1];
        }
        // At root, go back to landing
        navigate('/', { replace: true });
        return null;
    }, [stack, navigate]);

    /**
     * Replace the current screen with a new one (no history entry)
     */
    const replace = useCallback((screen: AuthScreen) => {
        setStack((prev) => [...prev.slice(0, -1), screen]);
    }, []);

    /**
     * Reset the navigation stack to initial state
     */
    const reset = useCallback(() => {
        setStack([{ type: 'SELECT_MODE' }]);
    }, []);

    /**
     * Navigate to landing page and clear stack
     */
    const goToLanding = useCallback(() => {
        setStack([{ type: 'SELECT_MODE' }]);
        navigate('/', { replace: true });
    }, [navigate]);

    const current = stack[stack.length - 1];
    const canGoBack = stack.length > 1;

    return {
        current,
        push,
        pop,
        replace,
        reset,
        goToLanding,
        canGoBack,
        stackDepth: stack.length,
    };
};

/**
 * Helper function to determine if a screen requires phone input
 */
export const requiresPhone = (screen: AuthScreen): boolean => {
    return (
        screen.type === 'QUICK_OTP_PHONE' ||
        screen.type === 'REGISTER_FORM' ||
        screen.type === 'PASSWORD_LOGIN'
    );
};

/**
 * Helper function to determine if a screen is an OTP verification screen
 */
export const isOTPScreen = (screen: AuthScreen): boolean => {
    return screen.type === 'QUICK_OTP_VERIFY' || screen.type === 'REGISTER_VERIFY';
};

/**
 * Get user-friendly title for each screen type
 */
export const getScreenTitle = (screen: AuthScreen): string => {
    switch (screen.type) {
        case 'SELECT_MODE':
            return 'Welcome to CivicLens';
        case 'QUICK_OTP_PHONE':
            return 'Quick Login';
        case 'QUICK_OTP_VERIFY':
            return 'Verify OTP';
        case 'REGISTER_FORM':
            return 'Create Full Account';
        case 'REGISTER_VERIFY':
            return 'Verify Phone Number';
        case 'PASSWORD_LOGIN':
            return 'Welcome Back';
        default:
            return 'CivicLens';
    }
};

/**
 * Get user-friendly subtitle for each screen type
 */
export const getScreenSubtitle = (screen: AuthScreen): string => {
    switch (screen.type) {
        case 'SELECT_MODE':
            return 'Choose how you want to continue';
        case 'QUICK_OTP_PHONE':
            return 'Enter your phone number to continue';
        case 'QUICK_OTP_VERIFY':
            return `OTP sent to ${screen.phone}`;
        case 'REGISTER_FORM':
            return 'Get access to all CivicLens features';
        case 'REGISTER_VERIFY':
            return `OTP sent to ${screen.phone}`;
        case 'PASSWORD_LOGIN':
            return 'Login to your account';
        default:
            return 'CivicLens Portal';
    }
};
