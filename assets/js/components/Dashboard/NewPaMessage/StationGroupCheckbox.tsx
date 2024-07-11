import React from "react";
import _ from "lodash";
import { Place } from "Models/place";

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
        .filter((screen) => _.intersection(screen.route_ids, routes).length > 0)
        .map((screen) => screen.id),
    );

  return (
    <div>
      <div className="group-title body--medium">{title}</div>
      <label className="group-stations body--regular">
        <input
          type="checkbox"
          onChange={(evt) => {
            if (evt.target.checked) {
              onChange(_.union(value, zones));
            } else {
              onChange(_.without(value, ...zones));
            }
          }}
          checked={zones.every((zone) => value.includes(zone))}
        />{" "}
        {label}
      </label>
    </div>
  );
};

export default StationGroupCheckbox;
