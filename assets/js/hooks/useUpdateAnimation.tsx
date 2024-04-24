import { useEffect, useRef, useState } from "react";

export const useUpdateAnimation = (
  deps: any[],
  prevValue: any,
  showAnimationOnMount?: boolean,
) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const timer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    // Prevents animation when already showing and on page load.
    if (
      timer.current !== undefined ||
      (!showAnimationOnMount && prevValue == null)
    ) {
      return;
    }

    setShowAnimation(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setShowAnimation(false);
    }, 2000);
  }, deps);

  // Cancel timer if component unmounts.
  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return { showAnimation };
};
