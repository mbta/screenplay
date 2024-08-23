import { useMemo } from "react";
import { Place } from "Models/place";

export const usePlacesWithSelectedScreens = (
  places: Place[],
  signIds: string[],
) => {
  return useMemo<Place[]>(() => {
    return places
      .map((place: Place) => ({
        ...place,
        screens: place.screens.filter((screen) => signIds.includes(screen.id)),
      }))
      .filter((place) => place.screens.length > 0);
  }, [places, signIds]);
};
