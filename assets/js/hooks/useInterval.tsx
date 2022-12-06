import { useEffect, useRef } from "react";

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function noop() {
  // do nothing
}

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(noop);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
