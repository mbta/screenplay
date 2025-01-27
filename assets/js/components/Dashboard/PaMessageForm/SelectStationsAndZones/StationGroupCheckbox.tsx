import React from "react";
import fp from "lodash/fp";
import { Place } from "Models/place";
import { Form } from "react-bootstrap";
import { getRouteIdsForSign } from "../../../../util";

interface Props {
  title: string;
  label: string;
  places: Place[];
  routes: string[];
  stations: string[];
  value: string[];
  onChange: (signIds: string[]) => void;
  disabled?: boolean;
}

const StationGroupCheckbox = ({
  title,
  label,
  places,
  routes,
  stations,
  value,
  onChange,
  disabled = false,
}: Props) => {
  const signIds = places
    .filter((place) => stations.includes(place.id))
    .flatMap((place) =>
      place.screens
        .filter(
          (screen) =>
            fp.intersection(routes, getRouteIdsForSign(screen)).length > 0,
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
        disabled={disabled}
      />
    </div>
  );
};

export default StationGroupCheckbox;
