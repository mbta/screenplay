import React, { useEffect, useState } from "react";
import StationColumn from "./StationColumn";

import WizardWarning from "./WizardWarning";
import { Station } from "../OutfrontTakeoverTool";

interface PickStationsProps {
  selectedStations: Station[];
  checkStation: (station: Station) => void;
  checkLine: (line: string, checked: boolean) => void;
  activeAlertsStations: string[];
}

const PickStations = (props: PickStationsProps): JSX.Element => {
  const [filteredAlerts, setFilteredAlerts] = useState<string[]>([]);

  useEffect(() => {
    setFilteredAlerts(
      props.activeAlertsStations.filter((station) =>
        props.selectedStations.map((station) => station.name).includes(station),
      ),
    );
  }, [props.selectedStations]);

  return (
    <>
      <div className="step-instructions flex">
        <div className="hang-left">
          <h3 className="step-header weight-700">Stations</h3>
          <p className="pick-station-message">Select stations for Takeover.</p>
          <p className="pick-station-message">
            Messages at transfer stations will be visible at ALL MODES serving
            that station.
          </p>
          <p className="pick-station-message">
            Above ground Green Line stops do not have Outfront Media screens.
          </p>
        </div>
        <div className="hang-right">
          <div className="legend-entry">
            <div className="legend-text text-14">Outfront DUPs</div>
            <div className="screen-icon landscape" />
          </div>
          <div className="legend-entry">
            <div className="legend-text text-14">Outfront Liveboards</div>
            <div className="screen-icon portrait" />
          </div>
          <div className="legend-entry">
            <div className="legend-text text-14">No Outfront screens</div>
            <div className="screen-icon none" />
          </div>
        </div>
      </div>
      <WizardWarning stationNames={filteredAlerts} />
      <div className="step-body stations">
        <div className={`station-column red`}>
          <StationColumn line="red" {...props} />
        </div>
        <div className={`station-column orange`}>
          <StationColumn line="orange" {...props} />
        </div>
        <div className="station-column">
          <StationColumn line="blue" {...props} />
          <br />
          <StationColumn line="silver" {...props} />
        </div>
        <div className={`station-column green`}>
          <StationColumn line="green" {...props} />
        </div>
      </div>
    </>
  );
};

export default PickStations;
