import { Place } from "Models/place";
import { Screen } from "Models/screen";
import React, { useEffect, useState } from "react";
import { GeoAltFill, X } from "react-bootstrap-icons";
import fp from "lodash/fp";
import { SILVER_LINE_ROUTES } from "Constants/constants";
import { classWithModifier } from "../../../util";
import pluralize from "pluralize";
interface Props {
  value: string[];
  onChange: (zones: string[]) => void;
  places: Place[];
  busRoutes: string[];
}

const SelectedGroupTag = ({
  numPlaces,
  routeId,
  onClick,
}: {
  numPlaces: number;
  routeId: string;
  onClick: () => void;
}) => {
  if (numPlaces === 0) return null;
  return (
    <div
      className={classWithModifier("selected-group-tag", routeId.toLowerCase())}
    >
      {routeId}: {numPlaces} {pluralize("Station", numPlaces)}
      <button className={routeId.toLowerCase()} onClick={onClick}>
        <X />
      </button>
    </div>
  );
};

const SelectedStationsSummary = ({
  value,
  places,
  busRoutes,
  onChange,
}: Props) => {
  const [placesWithSelectedScreens, setPlacesWithSelectedScreens] = useState<
    Place[]
  >([]);
  useEffect(() => {
    const t = fp.flow(
      fp.map((place: Place) => {
        return {
          ...place,
          screens: place.screens.filter((screen) =>
            fp.includes(screen.id, value),
          ),
        };
      }),
      fp.filter((place) => place.screens.length > 0),
    )(places);

    setPlacesWithSelectedScreens(t);
  }, [value]);

  const removeSelectedScreens = (filterFn: (screen: Screen) => boolean) => {
    const selectedScreens = fp.flow(
      fp.flatMap((place: Place) => place.screens),
      fp.filter(filterFn),
      fp.map((screen) => screen.id),
    )(placesWithSelectedScreens);

    onChange(fp.without(selectedScreens, value));
  };

  return (
    <div className="selected-stations-summary">
      <GeoAltFill width={12} />
      <div className="label">Stations selected:</div>
      {value.length === 0 ? (
        <span>None</span>
      ) : (
        <>
          {["Green", "Red", "Orange", "Blue", "Mattapan"].map((routeId) => (
            <SelectedGroupTag
              key={routeId}
              numPlaces={
                placesWithSelectedScreens.filter((place) =>
                  place.screens.some((screen) =>
                    screen.route_ids?.some((r) => r.startsWith(routeId)),
                  ),
                ).length
              }
              routeId={routeId}
              onClick={() => {
                removeSelectedScreens(
                  (screen) =>
                    screen.route_ids?.some((r) => r.startsWith(routeId)) ??
                    false,
                );
              }}
            />
          ))}
          <SelectedGroupTag
            numPlaces={
              placesWithSelectedScreens.filter((place) =>
                place.screens.some((screen) =>
                  screen.route_ids?.some((routeId) =>
                    SILVER_LINE_ROUTES.includes(routeId),
                  ),
                ),
              ).length
            }
            routeId="Silver"
            onClick={() => {
              removeSelectedScreens(
                (screen) =>
                  fp.intersection(SILVER_LINE_ROUTES, screen.route_ids).length >
                  0,
              );
            }}
          />
          <SelectedGroupTag
            numPlaces={
              placesWithSelectedScreens.filter((place) =>
                place.screens.some((screen) =>
                  screen.route_ids?.some((routeId) =>
                    busRoutes.includes(routeId),
                  ),
                ),
              ).length
            }
            routeId="Bus"
            onClick={() => {
              removeSelectedScreens(
                (screen) =>
                  fp.intersection(busRoutes, screen.route_ids).length > 0,
              );
            }}
          />
        </>
      )}
    </div>
  );
};

export default SelectedStationsSummary;
