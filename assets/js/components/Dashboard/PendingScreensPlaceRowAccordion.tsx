import React, { ComponentType } from "react";
import { ScreenConfiguration } from "../../models/screen_configuration";
import PendingScreenDetail from "./PendingScreenDetail";

interface Props {
  placeID: string;
  screens: LiveOrPendingScreen[];
}

interface LiveOrPendingScreen {
  isLive: boolean;
  screenID: string;
  config: ScreenConfiguration;
}

const PendingScreensPlaceRowAccordion: ComponentType<Props> = ({ placeID, screens }) => {
  // TODO: Need to get full Place info into this component, or at least Place name.

  // TODO: Designs show a "Type" field in accordion header, e.g. "Type: GL E-Ink".
  // This doesn't make sense for Places with multiple screen types, check w/ Mary what to do about it.
  return (
    <div className="pending-screens-place-row-accordion">
      <div className="pending-screens-place-row-accordion__header">
      </div>
      <div className="pending-screens-place-row-accordion__screen-details">
        {screens.map((screen) => <PendingScreenDetail {...screen} key={screen.screenID} />)}
      </div>
    </div>
  );
};

export default PendingScreensPlaceRowAccordion;
