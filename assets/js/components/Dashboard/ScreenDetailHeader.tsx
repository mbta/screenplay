import React, { useMemo } from "react";
import classNames from "classnames";
import { Screen } from "Models/screen";
import ScreenDetailActionBar from "Components/ScreenDetailActionBar";

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
        {props.screen.type === "dup_v2" && (
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

const generateSource = ({ id }: Screen) => {
  const screensUrl = document
    .querySelector("meta[name=screens-url]")
    ?.getAttribute("content");

  return `${screensUrl}/v2/screen/${id}`;
};

export default ScreenDetailHeader;
