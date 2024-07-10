import React from "react";
import _ from "lodash";
import type { Place } from "Models/place";
import { sortByStationOrder } from "../../../util"; // TODO: Move this file

const RouteColumn = ({
  label,
  route,
  places,
  value,
  onChange,
  reverse = false,
}: {
  label: string;
  route: string;
  places: Place[];
  value: string[];
  onChange: (zones: string[]) => void;
  reverse?: boolean;
}) => {
  const routeZones = places.flatMap((place) =>
    place.screens
      .filter((screen) => screen.route_ids?.includes(route))
      .map((screen) => screen.id),
  );

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => {
              if (evt.target.checked) {
                onChange(_.union(value, routeZones));
              } else {
                onChange(_.without(value, ...routeZones));
              }
            }}
            checked={routeZones.every((zone) => value.includes(zone))}
          />
          {label}
        </label>
      </div>
      <ol>
        {sortByStationOrder(places, route, reverse).map((place) => {
          const placeZones = place.screens
            .filter((screen) => screen.route_ids?.includes(route))
            .map((screen) => screen.id);
          return (
            <li key={place.id}>
              <label>
                <input
                  type="checkbox"
                  onChange={(evt) => {
                    if (evt.target.checked) {
                      onChange(_.union(value, placeZones));
                    } else {
                      onChange(_.without(value, ...placeZones));
                    }
                  }}
                  checked={value.some((zone) => placeZones.includes(zone))}
                />
                {place.name}
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default RouteColumn;
