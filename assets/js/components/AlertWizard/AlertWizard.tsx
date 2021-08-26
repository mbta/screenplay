import React from 'react';
import ConfirmationPage from './ConfirmationPage';
import CreateMessage from './CreateMessage';
import PickStations from './PickStations';
import SetSchedule from './SetSchedule';
import StationCard from './StationCard';
import WizardNavFooter from './WizardNavFooter';
import WizardStepper from './WizardStepper';

import stationsByLine, { Station } from '../../constants/stations'

import { XIcon } from '@heroicons/react/solid';

const modalContent = (
  <div className="cancel-modal">
    <div className="cancel-body">
      <div className="cancel-icon"></div>
      <div className="cancel-text">
        <div>Header</div>
        <div>Description</div>
      </div>
    </div>
    <div className="cancel-footer">
      <button>Never mind</button>
      <button>Confirm cancelation</button>
    </div>
  </div>
)

interface AlertWizardProps {
  triggerConfirmation: (modalContent: JSX.Element) => void
}

interface AlertWizardState {
  step: number;
  selectedStations: Station[]
  cancelModal: boolean;
}

class AlertWizard extends React.Component<AlertWizardProps, AlertWizardState> {
  constructor(props: AlertWizardProps) {
    super(props);
    this.state = {
      step: 1,
      selectedStations: [],
      cancelModal: false
    };

    this.stepForward = this.stepForward.bind(this);
    this.stepBackward = this.stepBackward.bind(this);
    this.checkStation = this.checkStation.bind(this);
    this.checkLine = this.checkLine.bind(this);
  }

  renderSwitch(step: number) {
    switch(step) {
      case 2:
        return <PickStations selectedStations={ this.state.selectedStations } checkStation={this.checkStation} checkLine={this.checkLine}/>;
      case 3:
        return <SetSchedule />;
      case 4:
        return <ConfirmationPage />;
      default:
        return <CreateMessage/>;
    }
  }

  stepForward() {
    this.setState(state => ({
      step: state.step + 1
    }))
  }

  stepBackward() {
    this.setState(state => ({
      step: state.step - 1
    }))
  }

  addStation(station: Station) {
    this.setState(state => ({
      selectedStations: state.selectedStations.concat(station)
    }))
  }
  removeStation(station: Station) {
    this.setState(state => ({
      selectedStations: state.selectedStations.filter(x => x !== station)
    }))
  }

  checkStation(station: Station) {
    if (this.state.selectedStations.some(x => x.name === station.name)) {
      this.removeStation(station)
    } else {
      this.addStation(station)
    }
  }

  checkLine(line: string, checked: boolean) {
    if (checked) {
      stationsByLine[line].forEach(station => {
        if (!this.state.selectedStations.some(x => x.name === station.name)) {
          this.addStation(station)
        }
      })
    } else {
      stationsByLine[line].forEach(station => this.removeStation(station))
    }
  }

  render() {
    return (
      <>
        <div className="wizard-container">
          <div className="wizard-left-content">
            <div className="wizard-header">
              <button className="wizard-cancel" onClick={() => this.props.triggerConfirmation(modalContent)}>
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
          <div className="wizard-sidebar">
            Preview
            { this.state.selectedStations.map(station => {
              if (!station.portrait && !station.landscape) {
                return null;
              }
              
              const lines = Object.keys(stationsByLine).filter(key => (
                stationsByLine[key].some(x => x.name === station.name) 
              ))

              return (
                <React.Fragment key={station.name}>
                  <div className="station-card read-only">
                    <StationCard lines={lines} station={station}/>
                  </div>
                  <div className="separator"><div></div></div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
        <WizardNavFooter step={this.state.step} forward={this.stepForward} backward={this.stepBackward}/>
        {/* <SimpleForm /> */}
      </>
    )
  }
};

export default AlertWizard;