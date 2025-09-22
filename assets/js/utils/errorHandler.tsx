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

// Error state management: getting, setting, clearing.
export const getErrorState = (): ErrorState | null => errorState;

const setErrorState = (error: ErrorState | null) => {
  errorState = error;
  errorListeners.forEach((listener) => listener(error));
};

export const clearErrorState = () => {
  setErrorState(null);
};

/**
 * Subscribes to changes in the error state. Used by components that rely on these errors.
 * @param listener - Function to call when error state changes
 * @returns unsubscribe function to remove the listener
 */
export const subscribeToError = (
  listener: (error: ErrorState | null) => void,
) => {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== listener);
  };
};

/** Determines if multiple errors have happened during the cooldown window. */
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

/**
 * Generates a user friendly error message based on the error type.
 * @returns the error message to display
 */
const getErrorMessage = (error: Error | Response): string => {
  if (error instanceof Response) {
    if (error.status >= 500) {
      return "Server error. Please try again or contact engineering if the problem persists.";
    } else if (error.status === 403) {
      return "Your session has expired, please refresh your browser.";
    } else if (error.status === 404) {
      return "The requested resource was not found. Please try again or contact engineering if the problem persists.";
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

/**
 * Generates a title for the error modal based on the error type and if there are multiple.
 */
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

/**
 * Surfaces the error to the user through the error modal.
 */
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
  const message = customMessage ?? getErrorMessage(error);
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

/**
 * Wrapper for operations that should display an error modal on their initial failure.
 * @param asyncFn - the function that should be tried
 * @param options - ErrorHandlingOptions
 */
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

        // If there's no handling specified and it's a session expiration error,
        // then we want to refresh the page after displaying the error
        if (!onError && isSessionExpirationError(error)) {
          options.onError = () => {
            setTimeout(() => window.location.reload(), 2000);
          };
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

/**
 * Wrapper for operations that should display an error modal on their initial failure.
 */
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

/**
 * Wrapper for operations that should fail silently (no error modal)
 */
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

/**
 * Wrapper for operations that should retry on failure
 */
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
 * Checks if an error is a session expiration error. 403 errors must be session expiration,
 * b/c a user must be logged in with proper permissions to access Screenplay initially.
 */
export const isSessionExpirationError = (error: any): boolean => {
  return error instanceof Response && error.status === 403;
};
