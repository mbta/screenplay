import { Place } from "Models/place";
import React, { useEffect } from "react";
import { GeoAltFill } from "react-bootstrap-icons";
import _ from "lodash";
interface Props {
  value: string[];
  onChange: (zones: string[]) => void;
  places: Place[];
}

const ROUTES = [
  "Green-B",
  "Green-C",
  "Green-D",
  "Green-E",
  "Red",
  "Orange",
  "Blue",
  "Silver",
  "Bus",
];

const SelectedStationsSummary = ({ value, places }: Props) => {
  useEffect(() => {
    const screens = _.chain(places)
      .map((place) => place.screens)
      .flatten()
      .filter(
        (screen) => screen.type === "pa_ess" && _.includes(value, screen.id),
      )
      .value();
  }, [value]);

  return (
    <div className="selected-stations-summary">
      <GeoAltFill width={12} />
      <div className="label">Stations selected:</div>
      {value.length === 0 ? <span>None</span> : <></>}
    </div>
  );
};

export default SelectedStationsSummary;
