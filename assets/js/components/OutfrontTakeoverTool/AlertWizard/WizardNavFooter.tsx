import React from "react";
import {
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
  PlayIcon,
} from "@heroicons/react/20/solid";

interface WizardNavFooterProps {
  step: number;
  forward: () => void;
  backward: () => void;
  waitingForInput: boolean;
  showErrorText: boolean;
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

const disabledText = (step: number) => {
  switch (step) {
    case 1:
      return "Please input message text above to continue";
    case 2:
      return "Please select affected stations above to continue";
  }
};

const WizardNavFooter = (props: WizardNavFooterProps): JSX.Element => {
  return (
    <div className="wizard-nav-footer">
      {props.step !== 1 ? (
        <button className="nav-button" onClick={props.backward}>
          <ArrowNarrowLeftIcon className="button-icon" />
          <span>{backButton(props.step)}</span>
        </button>
      ) : null}

      {props.step !== 4 ? (
        <div className="forward">
          {props.showErrorText && props.waitingForInput ? (
            <span className="disabled-text">{disabledText(props.step)}</span>
          ) : null}
          <button
            className={
              "nav-button" + (props.waitingForInput ? " disabled" : "")
            }
            onClick={props.forward}
          >
            <span>{forwardButton(props.step)}</span>
            <ArrowNarrowRightIcon className="button-icon right" />
          </button>
        </div>
      ) : (
        <div className="submit-button-stripes">
          <button className="submit-button" onClick={props.forward}>
            Post Takeover Alert
            <PlayIcon className="button-icon right" />
          </button>
        </div>
      )}
    </div>
  );
};

export default WizardNavFooter;
