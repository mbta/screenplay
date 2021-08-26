import React from 'react';
import { Station } from '../../constants/stations';
import { abbreviation, color } from '../../util';

interface StationCardProps {
  lines: string[]
  station: Station
}

const StationCard = (props: StationCardProps): JSX.Element => {

  return (
    <>
      {props.lines.map(line => (
        <div key={line} className="line-name abbrev" style={{backgroundColor: color(line)}}>{abbreviation(line)}</div>
      ))}
      <div className="station-name">{props.station.name}</div>
      {props.station.landscape && <div className="screen-icon landscape" />}
      {props.station.portrait && <div className="screen-icon portrait" />}
    </>
  )
};

export default StationCard;