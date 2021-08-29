import React from "react";
import stationsByLine, { Station } from "../../constants/stations";
import { abbreviation, color } from "../../util";

interface StackedStationCardsProps {
  selectedStations: Station[];
  className?: string;
}

const StackedStationCards = (props: StackedStationCardsProps): JSX.Element => {
  return (
    <div
      className={`stacked-station-cards ${
        props.className ? props.className : ""
      }`}
    >
      {props.selectedStations.map((station) => {
        if (!station.portrait && !station.landscape) {
          return null;
        }

        const lines = Object.keys(stationsByLine).filter((key) =>
          stationsByLine[key].some((x) => x.name === station.name)
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
              {station.landscape && <div className="screen-icon landscape" />}
              {station.portrait && (
                <div className="screen-icon portrait" />
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
