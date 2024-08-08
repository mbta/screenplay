import React from "react";
import { Place } from "Models/place";
import { GeoAltFill } from "react-bootstrap-icons";
import SelectedSignsByRouteTags from "../SelectedSignsByRouteTags";

interface Props {
  value: string[];
  onChange: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
}

const SelectedStationsSummary = ({
  value,
  places,
  busRoutes,
  onChange,
}: Props) => {
  return (
    <div className="selected-stations-summary">
      <GeoAltFill className="geo-alt-fill-icon" width={12} />
      <div className="label">Stations selected:</div>
      {value.length === 0 ? (
        <span>None</span>
      ) : (
        <SelectedSignsByRouteTags
          places={places}
          value={value}
          onChange={onChange}
          busRoutes={busRoutes}
        />
      )}
    </div>
  );
};

export default SelectedStationsSummary;
