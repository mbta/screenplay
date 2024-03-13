import React, { useMemo } from "react";
import classNames from "classnames";
import { Screen } from "../../models/screen";
import ScreenDetailActionBar from "./ScreenDetailActionBar";

interface ScreenDetailHeaderProps {
  screen: Screen;
  isMultipleScreens?: boolean;
  translatedScreenType: string | undefined;
  screenLocation: string;
}

const ScreenDetailHeader = (props: ScreenDetailHeaderProps): JSX.Element => {
  const url = useMemo(() => generateSource(props.screen), [props.screen]);

  return (
    <div className="screen-detail__header">
      <div className={classNames("screen-detail__screen-type-location")}>
        {props.translatedScreenType} {props.screenLocation}
        {["dup", "dup_v2"].includes(props.screen.type) && (
          <div className="screen-detail__dup-ad-text">
            Cycle in the ad loop for 7.5 seconds every 45 seconds
          </div>
        )}
      </div>
      <ScreenDetailActionBar
        screenUrl={url}
        isCollapsed={props.isMultipleScreens}
      />
    </div>
  );
};

const generateSource = (screen: Screen) => {
  const { id, type } = screen;
  // @ts-ignore Suppressing "object could be null" warning
  const screensUrl = document
    .querySelector("meta[name=screens-url]")
    ?.getAttribute("content");

  if (type.includes("v2")) {
    return `${screensUrl}/v2/screen/${id}`;
  }
  if (["bus_eink", "gl_eink_single", "gl_eink_double"].includes(type)) {
    return `${screensUrl}/screen/${id}`;
  }
  if (type === "solari") {
    // Solari app disables scrolling unless this param is added.
    // (Due to quirks of running on a very old browser in the past)
    return `${screensUrl}/screen/${id}?scroll=true`;
  }
  if (type === "dup") {
    return `${screensUrl}/screen/${id}`;
  }

  return "";
};

export default ScreenDetailHeader;
