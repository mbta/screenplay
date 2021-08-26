import React from 'react';
import SelectableLine from './SelectableLine';
import SelectableStation from './SelectableStation';
import stationsByLine, { Station } from '../../constants/stations'

interface StationColumnProps {
  line: string
  selectedStations: Station[]
  checkStation: (station: Station) => void
  checkLine: (line: string, checked: boolean) => void
}

const StationColumn = (props: StationColumnProps): JSX.Element => {
  return (
    <div>
      <SelectableLine
          line={props.line}
          checked={ stationsByLine[props.line].every(lineStation => props.selectedStations.some(x => x.name === lineStation.name)) }
          checkLine={ props.checkLine } />
      { stationsByLine[props.line].map(station => {
        const checked = props.selectedStations.some(x => x.name === station.name)
        return (
          <div key={ station.name } className={`station-card selectable ${checked ? 'selected-option' : ''}`}>
            <SelectableStation
                line={props.line}
                station={ station }
                checked={ checked }
                checkStation={ props.checkStation } />
          </div>
        )
      }) }
    </div>
  )
};

export default StationColumn;