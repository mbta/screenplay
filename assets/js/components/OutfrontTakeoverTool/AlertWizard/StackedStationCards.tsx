import React, { useContext } from "react";
import { abbreviation, color } from "../../../util";
import ScreenIcon from "./ScreenIcon";
import {
  Station,
  StationScreenOrientationContext,
} from "../OutfrontTakeoverTool";

interface StackedStationCardsProps {
  stations: Station[];
  className?: string;
}

const StackedStationCards = (props: StackedStationCardsProps): JSX.Element => {
  const stationScreenOrientationList = useContext(
    StationScreenOrientationContext
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
          stationScreenOrientationList[key].some((x) => x.name === station.name)
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
              {station.landscape && (
                <ScreenIcon
                  tooltipText="Outfront DUPs"
                  orientation="landscape"
                />
              )}
              {station.portrait && (
                <ScreenIcon
                  tooltipText="Outfront Liveboards"
                  orientation="portrait"
                />
              )}{" "}
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
