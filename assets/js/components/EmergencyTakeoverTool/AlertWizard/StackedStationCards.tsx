import React, { useContext } from "react";
import { abbreviation, color } from "../../../util";
import {
  Station,
  StationScreenOrientationContext,
} from "../EmergencyTakeoverTool";

interface StackedStationCardsProps {
  stations: Station[];
  className?: string;
}

const StackedStationCards = (props: StackedStationCardsProps): JSX.Element => {
  const stationScreenOrientationList = useContext(
    StationScreenOrientationContext,
  );
  return (
    <div
      className={`stacked-station-cards ${
        props.className ? props.className : ""
      }`}
    >
      {props.stations.map((station) => {
        if (!station.portrait && !station.landscape) {
          return null;
        }

        const lines = Object.keys(stationScreenOrientationList).filter((key) =>
          stationScreenOrientationList[key].some(
            (x) => x.name === station.name,
          ),
        );

        return (
          <React.Fragment key={station.name}>
            <div
              className={`station-card read-only ${
                props.className ? props.className : ""
              }`}
            >
              {lines.map((line) => (
                <div
                  key={line}
                  className="line-name abbrev"
                  style={{ backgroundColor: color(line) }}
                >
                  {abbreviation(line)}
                </div>
              ))}
              <div className="station-name">{station.name}</div>
            </div>
            <div
              className={`separator ${props.className ? props.className : ""}`}
            >
              <div></div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StackedStationCards;
