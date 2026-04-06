import React from "react";
import { color } from "../../../util";
import { Station } from "../EmergencyTakeoverTool";

interface SelectableStationProps {
  line: string;
  station: Station;
  checked: boolean;
  checkStation: (station: Station) => void;
}

const SelectableStation = (props: SelectableStationProps): JSX.Element => {
  const stationNameStyle = {
    color: color(props.line),
  };
  return (
    <>
      {!props.station.landscape && !props.station.portrait ? (
        <label>
          <div className="station-name disabled">{props.station.name}</div>
        </label>
      ) : (
        <label>
          <input
            name={props.station.name}
            type="checkbox"
            checked={props.checked}
            onChange={() => props.checkStation(props.station)}
          />
          <div className="station-name" style={stationNameStyle}>
            {props.station.name}
          </div>
        </label>
      )}
    </>
  );
};

export default SelectableStation;
