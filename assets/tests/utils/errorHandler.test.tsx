import {
  withErrorHandling,
  isSessionExpirationError,
  getErrorState,
  clearErrorState,
  subscribeToErrorState,
  unsubscribeFromErrorState,
} from "../../js/utils/errorHandler";

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, "location", {
  value: { reload: mockReload },
  writable: true,
});

describe("withErrorHandling", () => {
  beforeEach(() => {
    clearErrorState();
    mockReload.mockClear();
  });

  describe("Happy path", () => {
    it("happy path should return function result", async () => {
      const mockFunction = jest.fn().mockResolvedValue("success");
      const wrappedFunction = withErrorHandling(mockFunction);

      const result = await wrappedFunction("arg1", "arg2");

      expect(result).toBe("success");
      expect(mockFunction).toHaveBeenCalledWith("arg1", "arg2");
      expect(getErrorState()).toBeNull();
    });

    it("should pass through all arguments correctly", async () => {
      const mockFunction = jest.fn().mockResolvedValue("success");
      const wrappedFunction = withErrorHandling(mockFunction);

      await wrappedFunction(1, "test", { key: "value" }, [1, 2, 3]);

      expect(mockFunction).toHaveBeenCalledWith(
        1,
        "test",
        { key: "value" },
        [1, 2, 3],
      );
    });
  });

  describe("Error handling", () => {
    it("should return null and show error modal on failure", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFunction = withErrorHandling(mockFunction, {
        customMessage: "Test error with user facing message",
      });

      const result = await wrappedFunction();

      expect(result).toBeNull();
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(getErrorState()).not.toBeNull();
      expect(getErrorState()?.messageToDisplay).toBe(
        "Test error with user facing message",
      );
    });


    it("should call custom onError handler", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const onError = jest.fn();
      const wrappedFunction = withErrorHandling(mockFunction, { onError });

      await wrappedFunction();

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("Session expiration handling", () => {
    it("should handle session expiration errors with page reload", async () => {
      const mockResponse = new Response(null, { status: 403 });
      const mockFunction = jest.fn().mockRejectedValue(mockResponse);
      const wrappedFunction = withErrorHandling(mockFunction);

      mockReload.mockClear();

      await wrappedFunction();

      expect(getErrorState()).not.toBeNull();

      // Wait for the reload timeout
      await new Promise((resolve) => setTimeout(resolve, 2100));
      expect(mockReload).toHaveBeenCalled();
    });

    it("should not auto-reload when custom onError is provided", async () => {
      const mockResponse = new Response(null, { status: 403 });
      const mockFunction = jest.fn().mockRejectedValue(mockResponse);
      const customOnError = jest.fn();
      const wrappedFunction = withErrorHandling(mockFunction, {
        onError: customOnError,
      });

      mockReload.mockClear();

      await wrappedFunction();

      expect(customOnError).toHaveBeenCalledWith(mockResponse);
      await new Promise((resolve) => setTimeout(resolve, 2100));
      expect(mockReload).not.toHaveBeenCalled();
    });
  });

  describe("Error message handling", () => {
    it("should use custom error message when provided", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFunction = withErrorHandling(mockFunction, {
        customMessage: "Custom error message",
      });

      await wrappedFunction();

      const errorState = getErrorState();
      expect(errorState?.messageToDisplay).toBe("Custom error message");
    });

    it("should use custom error title when provided", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFunction = withErrorHandling(mockFunction, {
        customTitle: "Custom Error Title",
      });

      await wrappedFunction();

      const errorState = getErrorState();
      expect(errorState?.title).toBe("Custom Error Title");
    });
  });

  describe("Edge cases", () => {
    it("should handle null/undefined return values", async () => {
      const mockFunction = jest.fn().mockResolvedValue(null);
      const wrappedFunction = withErrorHandling(mockFunction);

      const result = await wrappedFunction();

      expect(result).toBeNull();
    });

    it("should handle functions that return different types", async () => {
      const mockFunction = jest.fn().mockResolvedValue({ data: "test" });
      const wrappedFunction = withErrorHandling(mockFunction);

      const result = await wrappedFunction();

      expect(result).toEqual({ data: "test" });
    });
  });

  describe("Error state subscription", () => {
    it("should notify subscribers when error state changes", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFunction = withErrorHandling(mockFunction);
      const subscriber = jest.fn();

      subscribeToErrorState(subscriber);

      await wrappedFunction();

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          messageToDisplay: expect.any(String),
          title: expect.any(String),
        }),
      );

      unsubscribeFromErrorState(subscriber);
    });

    it("should allow unsubscribing from error state changes", async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFunction = withErrorHandling(mockFunction);
      const subscriber = jest.fn();

      subscribeToErrorState(subscriber);
      unsubscribeFromErrorState(subscriber);

      await wrappedFunction();

      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});

describe("isSessionExpirationError", () => {
  it("should return true for 403 Response", () => {
    const response = new Response(null, { status: 403 });
    expect(isSessionExpirationError(response)).toBe(true);
  });

  it("should return false for non-403 Response", () => {
    const response = new Response(null, { status: 500 });
    expect(isSessionExpirationError(response)).toBe(false);
  });

  it("should return false for Error objects", () => {
    const error = new Error("Test error");
    expect(isSessionExpirationError(error)).toBe(false);
  });
});
