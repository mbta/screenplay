import { useScreenplayState } from "Hooks/useScreenplayContext";
import { useLayoutEffect } from "react";

export const useHideSidebar = () => {
  const { setShowSidebar } = useScreenplayState();
  useLayoutEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);
};
