import React from "react";
import {
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
} from "@heroicons/react/solid";

interface WizardNavFooterProps {
  step: number;
  forward: () => void;
  backward: () => void;
  waitingForInput: boolean;
}

const backButton = (step: number) => {
  switch (step) {
    case 2:
      return "Back to Message";
    case 3:
      return "Back to Stations";
    case 4:
      return "Back to Schedule";
  }
};

const forwardButton = (step: number) => {
  switch (step) {
    case 1:
      return "Continue to Stations";
    case 2:
      return "Continue to Schedule";
    case 3:
      return "Continue to Confirm";
  }
};

const WizardNavFooter = (props: WizardNavFooterProps): JSX.Element => {
  return (
    <div className="wizard-nav-footer">
      {props.step !== 1 ? (
        <button onClick={props.backward}>
          <ArrowNarrowLeftIcon className="arrow-icon" />
          <span>{backButton(props.step)}</span>
        </button>
      ) : null}
      {props.step !== 4 ? (
        <button
          className="forward-button"
          disabled={props.waitingForInput}
          onClick={props.forward}
        >
          <span>{forwardButton(props.step)}</span>
          <ArrowNarrowRightIcon className="arrow-icon" />
        </button>
      ) : (
        <button onClick={props.forward}>Fancy</button>
      )}
    </div>
  );
};

export default WizardNavFooter;
