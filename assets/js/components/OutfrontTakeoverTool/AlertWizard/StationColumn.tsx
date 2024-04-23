import React, { useContext } from "react";
import SelectableLine from "./SelectableLine";
import SelectableStation from "./SelectableStation";
import {
  Station,
  StationScreenOrientationContext,
} from "../OutfrontTakeoverTool";

interface StationColumnProps {
  line: string;
  selectedStations: Station[];
  checkStation: (station: Station) => void;
  checkLine: (line: string, checked: boolean) => void;
}

const StationColumn = (props: StationColumnProps): JSX.Element => {
  const stationScreenOrientationList = useContext(
    StationScreenOrientationContext,
  );
  return (
    <div>
      <SelectableLine
        line={props.line}
        checked={stationScreenOrientationList[props.line]
          // Ignore disabled stations when determining whether the whole line is selected
          .filter(({ landscape, portrait }) => landscape || portrait)
          .every((lineStation) =>
            props.selectedStations.some((x) => x.name === lineStation.name),
          )}
        checkLine={props.checkLine}
      />
      {stationScreenOrientationList[props.line].map((station) => {
        const checked = props.selectedStations.some(
          (x) => x.name === station.name,
        );
        return (
          <div
            key={station.name}
            className={`station-card selectable ${
              checked ? "selected-option" : ""
            }`}
          >
            <SelectableStation
              line={props.line}
              station={station}
              checked={checked}
              checkStation={props.checkStation}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StationColumn;
