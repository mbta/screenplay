import React from "react";
import _ from "lodash";
import type { Place } from "Models/place";
import { sortByStationOrder } from "../../../util";

const RouteColumn = ({
  label,
  routes,
  orderingRoute = routes[0],
  places,
  value,
  onChange,
  reverse = false,
}: {
  label: string;
  routes: string[];
  orderingRoute?: string;
  places: Place[];
  value: string[];
  onChange: (zones: string[]) => void;
  reverse?: boolean;
}) => {
  const routeZones = places.flatMap((place) =>
    place.screens
      .filter((screen) => _.intersection(screen.route_ids, routes).length > 0)
      .map((screen) => screen.id),
  );

  return (
    <div>
      <div>
        <label className="title">
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
      <div className="col-content">
        {sortByStationOrder(places, orderingRoute, reverse).map((place) => {
          const placeZones = place.screens
            .filter(
              (screen) =>
                _.intersection(screen.route_ids ?? [], routes).length > 0,
            )
            .map((screen) => screen.id);
          return (
            <div key={place.id}>
              <label className="body--regular station-name">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteColumn;
