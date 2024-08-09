import { useMemo } from "react";
import { busRouteIdsAtPlaces } from "../util";
import { BASE_ROUTE_NAME_TO_ROUTE_IDS } from "Constants/constants";
import { usePlacesWithPaEss } from "Hooks/usePlacesWithPaEss";

export const useRouteToRouteIDsMap = (): { [key: string]: string[] } => {
  const places = usePlacesWithPaEss();
  return useMemo(() => {
    return {
      ...BASE_ROUTE_NAME_TO_ROUTE_IDS,
      Bus: busRouteIdsAtPlaces(places),
    };
  }, [places]);
};
