import React from "react";
import fp from "lodash/fp";
import { Place } from "Models/place";
import { Form } from "react-bootstrap";

interface Props {
  title: string;
  label: string;
  places: Place[];
  routes: string[];
  stations: string[];
  value: string[];
  onChange: (signIds: string[]) => void;
}

const StationGroupCheckbox = ({
  title,
  label,
  places,
  routes,
  stations,
  value,
  onChange,
}: Props) => {
  const signIds = places
    .filter((place) => stations.includes(place.id))
    .flatMap((place) =>
      place.screens
        .filter(
          (screen) => fp.intersection(routes, screen.route_ids).length > 0,
        )
        .map((screen) => screen.id),
    );

  return (
    <div className="station-group">
      <div className="group-title body--medium">{title}</div>
      <Form.Check
        className="group-stations body--regular"
        label={label}
        type="checkbox"
        id={title}
        onChange={(evt) => {
          if (evt.target.checked) {
            onChange(fp.union(signIds, value));
          } else {
            onChange(fp.without(signIds, value));
          }
        }}
        checked={signIds.every((signId) => value.includes(signId))}
      />
    </div>
  );
};

export default StationGroupCheckbox;
