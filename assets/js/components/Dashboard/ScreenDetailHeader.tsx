import React from "react";
import classNames from "classnames";
import { Screen } from "../../models/screen";
import { SCREEN_TYPES } from "../../constants/constants";
import ScreenDetailActionBar from "./ScreenDetailActionBar";

interface ScreenDetailHeaderProps {
  screen: Screen;
  isMultipleScreens?: boolean;
}

const ScreenDetailHeader = (props: ScreenDetailHeaderProps): JSX.Element => {
  const translatedScreenType = SCREEN_TYPES.find(({ ids }) =>
    ids.includes(props.screen.type)
  )?.label;

  const getScreenLocation = props.screen.location
    ? `/ ${props.screen.location}`
    : "";

  const generateSource = (screen: Screen) => {
    const { id, type } = screen;
    // @ts-ignore Suppressing "object could be null" warning
    const screensUrl = document
      .querySelector("meta[name=screens-url]")
      ?.getAttribute("content");

    if (type.includes("v2")) {
      return `${screensUrl}/v2/screen/${id}`;
    }
    if (
      ["bus_eink", "gl_eink_single", "gl_eink_double", "solari"].includes(type)
    ) {
      return `${screensUrl}/screen/${id}`;
    }
    if (type === "dup") {
      return `${screensUrl}/screen/${id}`;
    }

    return "";
  };

  return (
    <div className="screen-detail__header">
      <div className={classNames("screen-detail__screen-type-location")}>
        {translatedScreenType} {getScreenLocation}
        {["dup", "dup_v2"].includes(props.screen.type) && (
          <div className="screen-detail__dup-ad-text">
            Cycle in the ad loop for 7.5 seconds every 45 seconds
          </div>
        )}
      </div>
      <ScreenDetailActionBar
        screenUrl={generateSource(props.screen)}
        isMultipleScreens={props.isMultipleScreens}
      />
    </div>
  );
};

export default ScreenDetailHeader;
