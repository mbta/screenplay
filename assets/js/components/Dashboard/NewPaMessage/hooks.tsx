import { useMemo } from "react";
import { Place } from "Models/place";
import { useScreenplayContext } from "Hooks/useScreenplayContext";
import { busRouteIdsAtPlaces } from "../../../util";
import { BASE_ROUTE_NAME_TO_ROUTE_IDS } from "Constants/constants";

export const usePlacesWithPaEss = () => {
  const { places } = useScreenplayContext();
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

export const useRouteToRouteIDsMap = (): { [key: string]: string[] } => {
  const places = usePlacesWithPaEss();
  return useMemo(() => {
    return {
      ...BASE_ROUTE_NAME_TO_ROUTE_IDS,
      Bus: busRouteIdsAtPlaces(places),
    };
  }, [places]);
};
