import React from "react";
import fp from "lodash/fp";
import type { Place } from "Models/place";
import { sortByStationOrder } from "../../../util";
import { Form } from "react-bootstrap";

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
      .filter((screen) => fp.intersection(routes, screen.route_ids).length > 0)
      .map((screen) => screen.id),
  );

  return (
    <div>
      <div>
        <Form.Check
          className="title"
          label={label}
          type="checkbox"
          id={`${label}-checkbox`}
          onChange={(evt) => {
            if (evt.target.checked) {
              onChange(fp.union(routeZones, value));
            } else {
              onChange(fp.without(routeZones, value));
            }
          }}
          checked={routeZones.every((zone) => value.includes(zone))}
        />
      </div>
      <div className="col-content">
        {sortByStationOrder(places, orderingRoute, reverse).map((place) => {
          const placeZones = place.screens
            .filter(
              (screen) => fp.intersection(routes, screen.route_ids).length > 0,
            )
            .map((screen) => screen.id);
          return (
            <div key={place.id}>
              <Form.Check
                className="body--regular station-name"
                label={place.name}
                id={`${place.name}-${orderingRoute}`}
                type="checkbox"
                onChange={(evt) => {
                  if (evt.target.checked) {
                    onChange(fp.union(placeZones, value));
                  } else {
                    onChange(fp.without(placeZones, value));
                  }
                }}
                checked={value.some((zone) => placeZones.includes(zone))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteColumn;
