import React from "react";
import { usePlacesWithSelectedScreens } from "./hooks";
import { Place } from "Models/place";
import { Screen } from "Models/screen";
import { classWithModifier } from "../../../util";
import pluralize from "pluralize";
import fp from "lodash/fp";
import { X } from "react-bootstrap-icons";
import { SILVER_LINE_ROUTES } from "Constants/constants";
import cx from "classnames";

const SelectedGroupTag = ({
  numPlaces,
  routeId,
  onRemove,
  onTagClick,
}: {
  numPlaces: number;
  routeId: string;
  onRemove: () => void;
  onTagClick: () => void;
}) => {
  if (numPlaces === 0) return null;

  return (
    <div
      className={classWithModifier("selected-group-tag", routeId.toLowerCase())}
    >
      <span className="label" onClick={onTagClick}>
        {routeId}: {pluralize("Station", numPlaces, true)}
      </span>
      <X
        className={cx("x-button", { "text-inverted": routeId === "Bus" })}
        onClick={onRemove}
      />
    </div>
  );
};

interface Props {
  value: string[];
  onChange: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
  onTagClick: () => void;
}

const SelectedSignsByRouteTags = ({
  places,
  value,
  onChange,
  busRoutes,
  onTagClick = () => {},
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
          onRemove={() => {
            removeSelectedScreens(
              (screen) =>
                screen.route_ids?.some((r) => r.startsWith(routeId)) ?? false,
            );
          }}
          onTagClick={onTagClick}
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
        onRemove={() => {
          removeSelectedScreens(
            (screen) =>
              fp.intersection(SILVER_LINE_ROUTES, screen.route_ids).length > 0,
          );
        }}
        onTagClick={onTagClick}
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
        onRemove={() => {
          removeSelectedScreens(
            (screen) => fp.intersection(busRoutes, screen.route_ids).length > 0,
          );
        }}
        onTagClick={onTagClick}
      />
    </>
  );
};

export default SelectedSignsByRouteTags;
