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
  isReadOnly = false,
}: {
  numPlaces: number;
  routeId: string;
  onRemove: () => void;
  onTagClick: () => void;
  isReadOnly?: boolean;
}) => {
  if (numPlaces === 0) return null;

  return (
    <div
      className={classWithModifier("selected-group-tag", routeId.toLowerCase())}
    >
      <span className="label" onClick={onTagClick}>
        {routeId}: {pluralize("Station", numPlaces, true)}
      </span>
      {!isReadOnly && (
        <X
          className={cx("x-button", { "text-inverted": routeId === "Bus" })}
          onClick={onRemove}
        />
      )}
    </div>
  );
};

interface Props {
  value: string[];
  onChange: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
  onTagClick?: () => void;
  isReadOnly?: boolean;
}

const SelectedSignsByRouteTags = ({
  places,
  value,
  onChange,
  busRoutes,
  onTagClick = () => {},
  isReadOnly = false,
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
          isReadOnly={isReadOnly}
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
        isReadOnly={isReadOnly}
      />
      <SelectedGroupTag
        numPlaces={getPlacesFromFilter(placesWithSelectedScreens, isBus).length}
        routeId="Bus"
        onRemove={() => {
          removeFilteredScreens(isBus);
        }}
        onTagClick={onTagClick}
        isReadOnly={isReadOnly}
      />
    </>
  );
};

export default SelectedSignsByRouteTags;
