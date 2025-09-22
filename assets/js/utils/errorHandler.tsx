export interface ErrorHandlingOptions {
  /** Whether to show an error modal for this error */
  showErrorModal?: boolean;
  /** Custom error message to display */
  customMessage?: string;
  /** Cutstom error title to display */
  customTitle?: string;
  /** Whether to log the error to console */
  logError?: boolean;
  /** Custom error handler function */
  onError?: (error: Error | Response) => void;
  /** Whether to retry the operation on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

export interface ErrorState {
  show: boolean;
  messageToDisplay: string;
  errorMessages?: string[];
  title: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

let errorState: ErrorState | null = null;
let errorListeners: ((error: ErrorState | null) => void)[] = [];
let errorCount = 0;
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000; // Don't show multiple errors within 5 seconds
const RETRY_DELAY_DEFAULT_MS = 1000;
const RETRY_ATTEMPTS_DEFAULT = 3;

export const subscribeToError = (
  listener: (error: ErrorState | null) => void,
) => {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== listener);
  };
};

export const getErrorState = (): ErrorState | null => errorState;

const setErrorState = (error: ErrorState | null) => {
  errorState = error;
  errorListeners.forEach((listener) => listener(error));
};

const isMultipleFailure = (): boolean => {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_COOLDOWN_MS) {
    errorCount++;
    return errorCount > 1;
  } else {
    errorCount = 1;
    lastErrorTime = now;
    return false;
  }
};

const getErrorMessage = (
  error: Error | Response,
  customMessage?: string,
): string => {
  if (customMessage) {
    return customMessage;
  }

  if (error instanceof Response) {
    if (error.status >= 500) {
      return "Server error. Please try again or contact engineering if the problem persists.";
    } else if (error.status === 403) {
      return "Your session has expired, please refresh your browser.";
    } else if (error.status === 404) {
      return "The requested resource was not found.";
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again and contact engineering if the issue persists.";
    }
  }

  return "Something went wrong. Please try again and contact engineering if the issue persists.";
};

const getErrorTitle = (
  error: Error | Response,
  isMultiple: string[],
): string => {
  if (isMultiple.length > 1) {
    return `${isMultiple.length} errors occurred`;
  }

  if (error instanceof Response) {
    if (error.status >= 500) {
      return "Server Error";
    } else if (error.status === 403) {
      return "Access Denied";
    } else if (error.status === 404) {
      return "Not Found";
    }
  }

  return "Error";
};

export const clearErrorState = () => {
  setErrorState(null);
};

export const displayErrorModal = (
  error: Error | Response,
  options: ErrorHandlingOptions = {},
) => {
  const { customMessage, customTitle, logError = true, onError } = options;

  if (logError) {
    console.error(error);
  }

  if (onError) {
    onError(error);
  }
  const message = getErrorMessage(error, customMessage);
  const errorMessages = getErrorState()?.errorMessages || [];
  errorMessages.push(message);
  const isMultiple = isMultipleFailure();
  const title =
    customTitle ?? getErrorTitle(error, isMultiple ? errorMessages : []);

  setErrorState({
    show: true,
    errorMessages: errorMessages,
    messageToDisplay: isMultiple ? `${errorMessages.join("\n")}` : message,
    title,
    onDismiss: clearErrorState,
  });
};

export const withErrorHandling = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions = {},
) => {
  return async (...args: T): Promise<R | null> => {
    const {
      showErrorModal = true,
      logError = true,
      onError,
      retry = false,
      retryAttempts = RETRY_ATTEMPTS_DEFAULT,
      retryDelay = RETRY_DELAY_DEFAULT_MS,
    } = options;

    let attempts = 0;

    while (attempts <= (retry ? retryAttempts : 0)) {
      try {
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        attempts++;

        if (logError) {
          console.error(
            `Error in ${asyncFn.name} (attempt ${attempts}):`,
            error,
          );
        }

        if (onError) {
          onError(error as Error | Response);
        }

        // If this is the last attempt or we're not retrying, handle the error
        if (attempts > (retry ? retryAttempts : 0)) {
          if (showErrorModal) {
            displayErrorModal(error as Error | Response, options);
          }
          return null;
        }

        // Wait before retrying
        if (retry && attempts <= retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * attempts),
          );
        }
      }
    }

    return null;
  };
};

// Convenience wrapper for the most common use case
export const withErrorHandlingDisplayError = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  customMessage?: string,
) => {
  return withErrorHandling(asyncFn, {
    showErrorModal: true,
    logError: true,
    customMessage,
  });
};

// Wrapper for operations that should fail silently (no global error)
export const withErrorHandlingSilent = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  onError?: (error: Error | Response) => void,
) => {
  return withErrorHandling(asyncFn, {
    showErrorModal: false,
    logError: true,
    onError,
  });
};

// Wrapper for operations that should retry on failure
export const withErrorHandlingRetry = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: {
    retryAttempts?: number;
    retryDelay?: number;
    customMessage?: string;
  } = {},
) => {
  return withErrorHandling(asyncFn, {
    showErrorModal: true,
    logError: true,
    retry: true,
    ...options,
  });
};

/**
 * Handles session expiration errors with automatic refresh
 * @param error - The error response (usually 403 status)
 * @param delay - Delay before auto-refresh in milliseconds (default: 2000)
 */
export const handleSessionExpiration = (
  error: Response | Error,
  delay: number = 2000,
) => {
  displayErrorModal(error, {
    customMessage: "Your session has expired, please refresh your browser.",
    onError: () => {
      // Auto-refresh after showing the error
      setTimeout(() => window.location.reload(), delay);
    },
  });
};

/**
 * Checks if an error is a session expiration error
 * @param error - The error to check
 * @returns true if it's a session expiration error
 */
export const isSessionExpirationError = (error: any): boolean => {
  return error instanceof Response && error.status === 403;
};
