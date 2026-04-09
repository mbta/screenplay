import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

interface WizardWarningProps {
  stationNames: string[];
}

const WizardWarning = (props: WizardWarningProps): JSX.Element | null => {
  return (
    <>
      {props.stationNames.length > 0 && (
        <div className="concurrent-warning-container">
          <div className="warning-container-child">
            <ExclamationCircleIcon className="icon-circle pink" />
          </div>

          <div className="warning-container-child">
            Continuing will replace the Live Takeover Alert already live at{" "}
            {props.stationNames.join(", ")}
          </div>
        </div>
      )}
    </>
  );
};

export default WizardWarning;
