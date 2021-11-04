import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

interface WizardWarningProps {
  stationNames: string[];
}

const WizardWarning = (props: WizardWarningProps): JSX.Element => {
  return (
    <div className="concurrent-warning-container">
      <div className="warning-container-child">
        <ExclamationCircleIcon className="icon-circle pink" />
      </div>

      <div className="warning-container-child warning-message">
        Continuing will replace the Live Takeover Alert already live at{" "}
        {props.stationNames.join(", ")}
      </div>
    </div>
  );
};

export default WizardWarning;
