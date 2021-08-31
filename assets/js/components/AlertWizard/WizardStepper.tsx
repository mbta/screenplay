import React from "react";
import { CheckIcon } from "@heroicons/react/solid";

interface WizardStepperProps {
  activeStep: number
}

const steps = ["Message", "Stations", "Schedule", "Confirm"]

const WizardStepper = (props: WizardStepperProps): JSX.Element => {
  const activeStep = props.activeStep - 1;
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div className="step" key={step}>
          <div className={`icon-circle ${activeStep >= index ? "pink" : "gray"}`}>
            {activeStep > index ? <CheckIcon className="icon"/> : <div className="icon">{index + 1}</div>}
          </div>
          <div className={`step-text ${activeStep === index ? "emphasized" : null} ${activeStep < index && "muted"}`}>{step}</div>
          <div className={`chevron ${index === 4 ? "invisible" : null}`}></div>
        </div>
      ))}
    </div>
  );
};

export default WizardStepper;
