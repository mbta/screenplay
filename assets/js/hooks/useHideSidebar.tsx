import { useScreenplayState } from "Hooks/useScreenplayContext";
import { useEffect } from "react";

export const useHideSidebar = () => {
  const { setShowSidebar } = useScreenplayState();
  useEffect(() => {
    setShowSidebar(false);
    return () => setShowSidebar(true);
  }, [setShowSidebar]);
};
