import { Place } from "Models/place";
import React, { useEffect, useState } from "react";
import { GeoAltFill } from "react-bootstrap-icons";
import _ from "lodash";
import { SILVER_LINE_ROUTES } from "Constants/constants";
import { classWithModifier } from "../../../util";
import pluralize from "pluralize";
interface Props {
  value: string[];
  onChange: (zones: string[]) => void;
  places: Place[];
}

const SelectedGroupTag = ({
  numPlaces,
  routeId,
}: {
  numPlaces: number;
  routeId: string;
}) => {
  if (numPlaces === 0) return null;
  return (
    <div
      className={classWithModifier("selected-group-tag", routeId.toLowerCase())}
    >
      {routeId}: {numPlaces} {pluralize("Station", numPlaces)}
    </div>
  );
};

const SelectedStationsSummary = ({ value, places }: Props) => {
  const [placesWithSelectedScreens, setPlacesWithSelectedScreens] = useState<
    Place[]
  >([]);
  useEffect(() => {
    const t = _.chain(places)
      .map((place) => {
        return {
          ...place,
          screens: place.screens.filter((screen) =>
            _.includes(value, screen.id),
          ),
        };
      })
      .filter((place) => place.screens.length > 0)
      .value();

    setPlacesWithSelectedScreens(t);
  }, [value]);

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
            />
          ))}
        </>
      )}
    </div>
  );
};

export default SelectedStationsSummary;
