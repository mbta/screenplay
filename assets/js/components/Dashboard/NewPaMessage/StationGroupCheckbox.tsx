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
  onChange: (zones: string[]) => void;
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
  const zones = places
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
            onChange(fp.union(zones, value));
          } else {
            onChange(fp.without(zones, value));
          }
        }}
        checked={zones.every((zone) => value.includes(zone))}
      />
    </div>
  );
};

export default StationGroupCheckbox;
