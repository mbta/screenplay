export interface ErrorHandlingOptions {
  /** Whether to show a global error modal for this error */
  showGlobalError?: boolean;
  /** Custom error message to display */
  customMessage?: string;
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

export interface GlobalErrorState {
  show: boolean;
  message: string;
  title: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

let globalErrorState: GlobalErrorState | null = null;
let globalErrorListeners: ((error: GlobalErrorState | null) => void)[] = [];
let errorCount = 0;
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000; // Don't show multiple errors within 5 seconds
const RETRY_DELAY_DEFAULT_MS = 1000;
const RETRY_ATTEMPTS_DEFAULT = 3;

export const subscribeToGlobalError = (
  listener: (error: GlobalErrorState | null) => void,
) => {
  globalErrorListeners.push(listener);
  return () => {
    globalErrorListeners = globalErrorListeners.filter((l) => l !== listener);
  };
};

export const getGlobalError = (): GlobalErrorState | null => globalErrorState;

const setGlobalError = (error: GlobalErrorState | null) => {
  globalErrorState = error;
  globalErrorListeners.forEach((listener) => listener(error));
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
      return "You don't have permission to perform this action.";
    } else if (error.status === 404) {
      return "The requested resource was not found.";
    } else if (error.status >= 400) {
      return "Request failed. Please check your input and try again.";
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
};

const getErrorTitle = (
  error: Error | Response,
  isMultiple: boolean,
): string => {
  if (isMultiple) {
    return "Multiple Errors Occurred";
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

export const clearGlobalError = () => {
  setGlobalError(null);
};

export const showGlobalError = (
  error: Error | Response,
  options: ErrorHandlingOptions = {},
) => {
  const { customMessage, logError = true, onError } = options;

  if (logError) {
    console.error("Global error occurred:", error);
  }

  if (onError) {
    onError(error);
  }

  const isMultiple = isMultipleFailure();
  const message = getErrorMessage(error, customMessage);
  const title = getErrorTitle(error, isMultiple);

  setGlobalError({
    show: true,
    message: isMultiple
      ? `${message} (${errorCount} errors occurred)`
      : message,
    title,
    onDismiss: clearGlobalError,
  });
};

export const withErrorHandling = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions = {},
) => {
  return async (...args: T): Promise<R | null> => {
    const {
      showGlobalError: shouldShowGlobalError = true,
      logError = true,
      onError,
      retry = false,
      retryAttempts = RETRY_ATTEMPTS_DEFAULT,
      retryDelay = RETRY_DELAY_DEFAULT_MS,
    } = options;

    let lastError: Error | Response | null = null;
    let attempts = 0;

    while (attempts <= (retry ? retryAttempts : 0)) {
      try {
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        lastError = error as Error | Response;
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
          if (shouldShowGlobalError) {
            showGlobalError(error as Error | Response, options);
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
export const withErrorHandlingDisplayGlobalError = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  customMessage?: string,
) => {
  return withErrorHandling(asyncFn, {
    showGlobalError: true,
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
    showGlobalError: false,
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
    showGlobalError: true,
    logError: true,
    retry: true,
    ...options,
  });
};
