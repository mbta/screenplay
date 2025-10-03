import { useEffect, useState } from "react";
import {
  ErrorState,
  subscribeToErrorState,
  unsubscribeFromErrorState,
} from "../utils/errorHandler";

export const useErrorState = () => {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  useEffect(() => {
    // On render, set Error State to initial null value and subscribe to receive any updates
    const errorListener = (errorState: ErrorState | null) => {
      setErrorState(errorState);
    };
    subscribeToErrorState(errorListener);

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromErrorState(errorListener);
    };
  });

  return { errorState };
};
