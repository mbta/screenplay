export interface ErrorHandlingOptions {
  /** Custom error message to display */
  customMessage?: string;
  /** Cutstom error title to display */
  customTitle?: string;
  /** Custom error handler function */
  onError?: (error: Error | Response) => void;
}

export interface ErrorState {
  messageToDisplay: string;
  errorMessages?: string[];
  title: string;
}

// Error state management: getting, setting, clearing.
export const getErrorState = (): ErrorState | null => errorState;

const setErrorState = (error: ErrorState | null) => {
  errorState = error;
  errorListeners.forEach((listener) => listener(error));
};

export const clearErrorState = () => {
  setErrorState(null);
};

let errorState: ErrorState | null = null;
let errorListeners: ((error: ErrorState | null) => void)[] = [];
let errorCount = 0;
let lastErrorTime = 0;
const ERROR_COOLDOWN_MS = 5000; // Don't show multiple errors within 5 seconds

/**
 * Subscribes the error state by passing in a listener function to be called on state channges.
 * Used by components that rely on the global error state.
 */
export const subscribeToErrorState = (
  listener: (error: ErrorState | null) => void,
) => {
  errorListeners.push(listener);
};

/**
 * Unsubscribes to changes in the error state by passing in the subscribed listener function.
 */
export const unsubscribeFromErrorState = (
  listener: (error: ErrorState | null) => void,
) => {
  errorListeners = errorListeners.filter((l) => l !== listener);
};

/**
 * Wrapper for operations to handle errors and display an error modal in case of failure.
 * @param asyncFunction - the function that should be tried
 * @param options - ErrorHandlingOptions
 */
export const withErrorHandling = <T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  options: ErrorHandlingOptions = {},
) => {
  return async (...args: T): Promise<R | null> => {
    const { onError } = options;

    try {
      const result = await asyncFunction(...args);
      return result;
    } catch (error) {
      console.error(`Error in ${asyncFunction.name}:`, error);

      // If there's no handling specified and it's a session expiration error,
      // then we want to refresh the page after displaying the error
      if (!onError && isSessionExpirationError(error)) {
        options.onError = () => {
          setTimeout(() => window.location.reload(), 2000);
        };
      }

      displayErrorModal(error as Error | Response, options);

      return null;
    }
  };
};

/**
 * Surfaces the error to the user through the error modal.
 */
export const displayErrorModal = (
  error: Error | Response,
  options: ErrorHandlingOptions = {},
) => {
  console.log('test')
  const { customMessage, customTitle, onError } = options;

  const message = customMessage ?? getErrorMessage(error);
  const errorMessages = getErrorState()?.errorMessages || [];
  errorMessages.push(message);
  const isMultiple = isMultipleFailure();
  const title =
    customTitle ?? getErrorTitle(error, isMultiple ? errorMessages : []);

  if (onError) {
    onError(error);
  }

  setErrorState({
    errorMessages: errorMessages,
    messageToDisplay: isMultiple ? `${errorMessages.join("\n")}` : message,
    title,
  });
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
 * Checks if an error is a session expiration error. 403 errors must be session expiration,
 * b/c a user must be logged in with proper permissions to access Screenplay initially.
 */
export const isSessionExpirationError = (error: any): boolean => {
  return error instanceof Response && error.status === 403;
};
