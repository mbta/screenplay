import React from "react";

import {
  ExclamationTriangleIcon,
  PlusCircleIcon,
} from "@heroicons/react/20/solid";

interface IntroBlockProps {
  startAlertWizard: () => void;
}

const IntroBlock = (props: IntroBlockProps): JSX.Element => {
  return (
    <div className="intro-block">
      <div className="exclamation-circle">
        <ExclamationTriangleIcon className="exclamation" />
      </div>
      <ul className="intro-text">
        <li>
          This tool temporarily replaces Outfront Media advertising content in
          stations with rider-facing alerts.
        </li>
        <li>
          Use it to reinforce Live PA audio during{" "}
          <span className="emphasized">
            safety-critical emergencies requiring riders to take action
          </span>
          .
        </li>
      </ul>
      <button className="create-alert-button" onClick={props.startAlertWizard}>
        <PlusCircleIcon className="button-icon" />
        <span className="text-16">Create new Takeover Alert</span>
      </button>
    </div>
  );
};

export default IntroBlock;
