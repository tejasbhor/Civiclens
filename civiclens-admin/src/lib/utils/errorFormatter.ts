/**
 * Utility functions for safely formatting and rendering errors
 */

export type ErrorValue = string | object | Error | null | undefined;

/**
 * Safely convert any error value to a string
 */
export function formatError(error: ErrorValue): string {
  if (!error) return '';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object') {
    // Check for common API error structures
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    
    // Fallback to JSON string
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }
  
  return String(error);
}

/**
 * Get error message from various error formats
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  // Handle Pydantic validation errors
  if (Array.isArray(error)) {
    const messages = error
      .map(e => {
        if (typeof e === 'object' && 'msg' in e) {
          return e.msg;
        }
        return formatError(e);
      })
      .filter(Boolean);
    return messages.join(', ') || 'Validation error';
  }
  
  return formatError(error);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  if (Array.isArray(error)) return true;
  if (error?.type === 'validation') return true;
  if (error?.status === 422) return true;
  return false;
}
