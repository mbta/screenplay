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
    // Disabling this because this code predates our usage of the `react-hooks`
    // eslint plugin. There's likely a better way to achieve this effect but
    // we are disabling this check for now.
    // - sloane 2024-08-20
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel timer if component unmounts.
  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return { showAnimation };
};
