import React from "react";
import { usePlacesWithSelectedScreens } from "./hooks";
import { Place } from "Models/place";
import { Screen } from "Models/screen";
import { classWithModifier } from "../../../util";
import pluralize from "pluralize";
import fp from "lodash/fp";
import { X } from "react-bootstrap-icons";
import { SILVER_LINE_ROUTES } from "Constants/constants";

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
      {routeId}: {pluralize("Station", numPlaces, true)}
      <button className={routeId.toLowerCase()} onClick={onClick}>
        <X className="x-button" />
      </button>
    </div>
  );
};

interface Props {
  value: string[];
  onChange: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
}

const SelectedSignsByRouteTags = ({
  places,
  value,
  onChange,
  busRoutes,
}: Props) => {
  const placesWithSelectedScreens = usePlacesWithSelectedScreens(places, value);
  const removeSelectedScreens = (filterFn: (screen: Screen) => boolean) => {
    const selectedScreens = fp.flow(
      fp.flatMap((place: Place) => place.screens),
      fp.filter(filterFn),
      fp.map((screen) => screen.id),
    )(placesWithSelectedScreens);

    onChange(fp.without(selectedScreens, value));
  };
  return (
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
                screen.route_ids?.some((r) => r.startsWith(routeId)) ?? false,
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
              fp.intersection(SILVER_LINE_ROUTES, screen.route_ids).length > 0,
          );
        }}
      />
      <SelectedGroupTag
        numPlaces={
          placesWithSelectedScreens.filter((place) =>
            place.screens.some((screen) =>
              screen.route_ids?.some((routeId) => busRoutes.includes(routeId)),
            ),
          ).length
        }
        routeId="Bus"
        onClick={() => {
          removeSelectedScreens(
            (screen) => fp.intersection(busRoutes, screen.route_ids).length > 0,
          );
        }}
      />
    </>
  );
};

export default SelectedSignsByRouteTags;
