import React from "react";
import { color } from "../../util";

interface SelectableLineProps {
  line: string;
  checked: boolean;
  checkLine: (line: string, checked: boolean) => void;
}

const SelectableLine = (props: SelectableLineProps): JSX.Element => {
  const lineNameStyle = {
    backgroundColor: color(props.line),
  };
  return (
    <div className="station-card line selectable">
      <label>
        <input
          name={props.line}
          type="checkbox"
          checked={props.checked}
          onChange={() => props.checkLine(props.line, !props.checked)}
        />
        <div className="line-name" style={lineNameStyle}>
          {props.line.toUpperCase()}
        </div>
      </label>
    </div>
  );
};

export default SelectableLine;
