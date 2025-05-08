import { useMemo } from "react";
import { Place } from "Models/place";
import { useScreenplayState } from "Hooks/useScreenplayContext";

export const usePlacesWithPaEss = () => {
  const { places } = useScreenplayState();
  return useMemo(
    () =>
      places
        .map((place) => ({
          ...place,
          screens: place.screens.filter((screen) => screen.type === "pa_ess"),
        }))
        .filter((place: Place) => place.screens.length > 0),
    [places],
  );
};
