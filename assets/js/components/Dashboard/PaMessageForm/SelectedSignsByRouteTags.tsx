import React from "react";
import { usePlacesWithSelectedScreens } from "./hooks";
import { Place } from "Models/place";
import { classWithModifier, getPlacesFromFilter } from "../../../util";
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
  onTagClick?: () => void;
}

const SelectedSignsByRouteTags = ({
  places,
  value,
  onChange,
  busRoutes,
  onTagClick = () => {},
}: Props) => {
  const placesWithSelectedScreens = usePlacesWithSelectedScreens(places, value);
  const removeFilteredScreens = (filterFn: (routeId: string) => boolean) => {
    const selectedScreens = getPlacesFromFilter(
      placesWithSelectedScreens,
      filterFn,
    )
      .flatMap((place) => place.screens)
      .map((screen) => screen.id);

    onChange(fp.without(selectedScreens, value));
  };

  const isSilverLine = (r: string) => SILVER_LINE_ROUTES.includes(r);
  const isBus = (r: string) => busRoutes.includes(r);

  return (
    <>
      {["Green", "Red", "Orange", "Blue", "Mattapan"].map((routeId) => (
        <SelectedGroupTag
          key={routeId}
          numPlaces={
            getPlacesFromFilter(placesWithSelectedScreens, (r) =>
              r.startsWith(routeId),
            ).length
          }
          routeId={routeId}
          onRemove={() => {
            removeFilteredScreens((r) => r.startsWith(routeId));
          }}
          onTagClick={onTagClick}
        />
      ))}
      <SelectedGroupTag
        numPlaces={
          getPlacesFromFilter(placesWithSelectedScreens, isSilverLine).length
        }
        routeId="Silver"
        onRemove={() => {
          getPlacesFromFilter(placesWithSelectedScreens, isSilverLine);
        }}
        onTagClick={onTagClick}
      />
      <SelectedGroupTag
        numPlaces={getPlacesFromFilter(placesWithSelectedScreens, isBus).length}
        routeId="Bus"
        onRemove={() => {
          removeFilteredScreens(isBus);
        }}
        onTagClick={onTagClick}
      />
    </>
  );
};

export default SelectedSignsByRouteTags;
