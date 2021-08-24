import React from 'react';
import CreateMessage from './CreateMessage';
import SimpleForm from '../SimpleForm';
import WizardNavFooter from './WizardNavFooter';
import WizardStepper from './WizardStepper';

import { XIcon } from '@heroicons/react/solid';


interface AlertWizardProps {}

interface AlertWizardState {
  step: number;
}

class AlertWizard extends React.Component<AlertWizardProps, AlertWizardState> {
  constructor(props: AlertWizardProps) {
    super(props);
    this.state = {
      step: 1
    };
  }

  renderSwitch(step: number) {
    switch(step) {
      case 2:
        return {/* <PickStations /> */};
      case 3:
        return {/* <SetSchedule /> */};
      case 4:
        return {/* <ConfirmationPage /> */};
      default:
        return <CreateMessage/>;
    }
  }

  render() {

    return (
      <>
        <div className="wizard-container">
          <div className="wizard-left-content">
            <div className="wizard-header">
              <button className="wizard-cancel">
                <XIcon className="x"/>
                <span className="text-16 weight-500">Cancel</span>
              </button>
              <div className="wizard-title text-30 weight-800">Create new Takeover Alert</div>
            </div>
            <WizardStepper/>
            <div className="wizard-body">
              {this.renderSwitch(this.state.step)}
            </div>
          </div>
          <div className="wizard-sidebar">Preview</div>
        </div>
        <WizardNavFooter step={this.state.step}/>
        {/* <SimpleForm /> */}
      </>
    )
  }
};

export default AlertWizard;