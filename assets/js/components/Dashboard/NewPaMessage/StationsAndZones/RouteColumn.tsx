import React from "react";
import fp from "lodash/fp";
import type { Place } from "Models/place";
import { sortByStationOrder } from "../../../../util";
import { Form } from "react-bootstrap";

const RouteColumn = ({
  label,
  routeIds,
  orderingRouteId = routeIds[0],
  places,
  value,
  onChange,
  reverse = false,
}: {
  label: string;
  routeIds: string[];
  orderingRouteId?: string;
  places: Place[];
  value: string[];
  onChange: (signIds: string[]) => void;
  reverse?: boolean;
}) => {
  const signsIdsAtRoutes = places.flatMap((place) =>
    place.screens
      .filter(
        (screen) => fp.intersection(routeIds, screen.route_ids).length > 0,
      )
      .map((screen) => screen.id),
  );

  return (
    <>
      <div>
        <Form.Check
          className="title"
          label={label}
          type="checkbox"
          id={`${label}-checkbox`}
          onChange={(evt) => {
            if (evt.target.checked) {
              onChange(fp.union(signsIdsAtRoutes, value));
            } else {
              onChange(fp.without(signsIdsAtRoutes, value));
            }
          }}
          checked={signsIdsAtRoutes.every((signId) => value.includes(signId))}
        />
      </div>
      <div className="col-content">
        {sortByStationOrder(places, orderingRouteId, reverse).map((place) => {
          const signIdsAtPlace = place.screens
            .filter(
              (screen) =>
                fp.intersection(routeIds, screen.route_ids).length > 0,
            )
            .map((screen) => screen.id);
          return (
            <div key={place.id}>
              <Form.Check
                className="body--regular station-name"
                label={place.name}
                id={`${place.name}-${orderingRouteId}`}
                type="checkbox"
                onChange={(evt) => {
                  if (evt.target.checked) {
                    onChange(fp.union(signIdsAtPlace, value));
                  } else {
                    onChange(fp.without(signIdsAtPlace, value));
                  }
                }}
                checked={value.some((signId) =>
                  signIdsAtPlace.includes(signId),
                )}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RouteColumn;
