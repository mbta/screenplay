import { useMemo } from "react";
import { Place } from "Models/place";
import fp from "lodash/fp";
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
  signs: string[],
) => {
  return useMemo<Place[]>(() => {
    return fp.flow(
      fp.map((place: Place) => {
        return {
          ...place,
          screens: place.screens.filter((screen) =>
            fp.includes(screen.id, signs),
          ),
        };
      }),
      fp.filter((place) => place.screens.length > 0),
    )(places);
  }, [places, signs]);
};

export const useRouteToRouteIDsMap = (): { [key: string]: string[] } => {
  const places = usePlacesWithPaEss();
  return useMemo(() => {
    return {
      ...BASE_ROUTE_NAME_TO_ROUTE_IDS,
      Bus: busRouteIdsAtPlaces(places),
    };
  }, []);
};
