import { useEffect, useState } from "react";

export const useUpdateAnimation = (
  deps: any[],
  prevValue: any,
  showAnimationOnMount?: boolean
) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  useEffect(() => {
    // Prevents animation when already showing and on page load.
    if (timer || (!showAnimationOnMount && prevValue !== undefined)) {
      return;
    }

    setShowAnimation(true);
    const newTimer = setTimeout(() => {
      setTimer(undefined);
      setShowAnimation(false);
    }, 2000);
    setTimer(newTimer);

    // Cancel timer is component unmounts.
    return () => clearTimeout(newTimer);
  }, deps);

  return { showAnimation };
};
