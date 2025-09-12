import { toast } from "sonner";

// User-friendly error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Database errors
  'PGRST301': 'Unable to connect to the database. Please check your internet connection.',
  'PGRST204': 'The requested data was not found.',
  'PGRST116': 'No matching records found.',
  'PGRST400': 'Invalid request. Please check your input and try again.',
  'PGRST401': 'You are not authorized to perform this action.',
  'PGRST403': 'Access denied. You do not have permission to access this resource.',
  'PGRST500': 'Server error occurred. Please try again later.',
  
  // Network errors
  'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
  'TIMEOUT_ERROR': 'Request timed out. Please try again.',
  
  // Auth errors
  'invalid_credentials': 'Invalid email or password. Please try again.',
  'email_not_confirmed': 'Please confirm your email address before signing in.',
  'user_not_found': 'No account found with this email address.',
  'weak_password': 'Password is too weak. Please choose a stronger password.',
  'email_already_exists': 'An account with this email already exists.',
  
  // Cash & Bank specific errors
  'insufficient_funds': 'Insufficient balance in the selected account.',
  'account_not_found': 'The specified account could not be found.',
  'duplicate_account_code': 'This account number already exists. Please choose a different number.',
  'invalid_transfer': 'This transfer cannot be completed. Please check account types and try again.',
  'same_account_transfer': 'You cannot transfer funds to the same account.',
  'credit_to_debit_transfer': 'Cannot transfer funds from Credit account to Debit account.',
  'debit_to_credit_transfer': 'Cannot transfer funds from Debit account to Credit account.',
  
  // Generic fallbacks
  'unknown_error': 'An unexpected error occurred. Please try again.',
  'validation_error': 'Please check your input and try again.',
  'server_error': 'Server is temporarily unavailable. Please try again later.',
};

export interface AppError {
  code: string;
  message: string;
  originalError?: any;
}

export const createAppError = (code: string, originalError?: any): AppError => ({
  code,
  message: ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown_error,
  originalError
});

export const handleError = (error: any, fallbackMessage?: string): AppError => {
  console.error('Error caught by handler:', error);
  
  let errorCode = 'unknown_error';
  
  // Handle Supabase errors
  if (error?.code) {
    errorCode = error.code;
  }
  // Handle network errors
  else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    errorCode = 'NETWORK_ERROR';
  }
  // Handle timeout errors
  else if (error?.message?.includes('timeout')) {
    errorCode = 'TIMEOUT_ERROR';
  }
  // Handle auth errors
  else if (error?.message?.includes('credentials')) {
    errorCode = 'invalid_credentials';
  }
  // Handle specific error messages
  else if (error?.message) {
    const message = error.message.toLowerCase();
    if (message.includes('insufficient')) {
      errorCode = 'insufficient_funds';
    } else if (message.includes('not found')) {
      errorCode = 'account_not_found';
    } else if (message.includes('already exists')) {
      errorCode = 'duplicate_account_code';
    }
  }
  
  const appError = createAppError(errorCode, error);
  
  // Show toast notification with user-friendly message
  toast.error(fallbackMessage || appError.message);
  
  return appError;
};

export const showSuccessMessage = (message: string) => {
  toast.success(message);
};

export const showWarningMessage = (message: string) => {
  toast.warning(message);
};

export const showInfoMessage = (message: string) => {
  toast.info(message);
};