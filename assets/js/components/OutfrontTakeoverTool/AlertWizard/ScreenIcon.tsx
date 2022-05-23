import React from "react";

interface ScreenIconProps {
  tooltipText: string;
  orientation: string;
}

const ScreenIcon = (props: ScreenIconProps): JSX.Element => {
  return (
    <div
      className={"screen-icon " + props.orientation}
      data-tip={props.tooltipText}
    />
  );
};

export default ScreenIcon;
