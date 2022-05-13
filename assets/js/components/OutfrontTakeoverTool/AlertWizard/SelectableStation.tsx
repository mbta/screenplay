import React from "react";
import { Station } from "../../../constants/stations";
import { color } from "../../../util";

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
          {!props.station.landscape && !props.station.portrait && (
            <div className="screen-icon none" />
          )}
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
          {props.station.landscape && <div className="screen-icon landscape" />}
          {props.station.portrait && <div className="screen-icon portrait" />}
        </label>
      )}
    </>
  );
};

export default SelectableStation;
