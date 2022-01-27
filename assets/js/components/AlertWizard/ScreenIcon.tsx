import React from "react";

import ReactTooltip from "react-tooltip";

interface ScreenIconProps {
  tooltipText: string;
  orientation: string;
  id: string;
}

const ScreenIcon = (props: ScreenIconProps): JSX.Element => {
  return (
    <>
      <span
        data-for={props.id}
        className={"screen-icon " + props.orientation}
        data-tip={props.tooltipText}
      />
      <ReactTooltip id={props.id} />
    </>
  );
};

export default ScreenIcon;
