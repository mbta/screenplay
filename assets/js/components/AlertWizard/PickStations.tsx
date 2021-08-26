import React from 'react';
import StationColumn from './StationColumn';

import { Station } from '../../constants/stations'

interface PickStationsProps {
  selectedStations: Station[]
  checkStation: (station: Station) => void
  checkLine: (line: string, checked: boolean) => void
}

const PickStations = (props: PickStationsProps): JSX.Element => {
  return (
    <>
      <div className="step-instructions flex">
        <div className="hang-left">
          <div className="step-header weight-700">Stations</div>
          <div>Select stations for Takeover.</div>
          <div>Messages at transfer stations will be visible at ALL MODES serving that station.</div>
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
      <div className="step-body stations">
        <div className={`station-column red`}><StationColumn line="red" { ...props }/></div>
        <div className={`station-column orange`}><StationColumn line="orange" { ...props }/></div>
        <div className="station-column">
          <StationColumn line="blue" { ...props }/>
          <br/>
          <StationColumn line="silver" { ...props }/>
        </div>
        <div className={`station-column green`}><StationColumn line="green" { ...props }/></div>
      </div>
    </>
  )
};

export default PickStations;
