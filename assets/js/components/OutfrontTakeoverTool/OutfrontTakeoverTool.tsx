import React, { createContext } from "react";
import AlertDashboard from "./AlertDashboard/AlertDashboard";
import AlertWizard from "./AlertWizard/AlertWizard";
import ConfirmationModal, { ModalDetails } from "./ConfirmationModal";

export interface Station {
  name: string;
  portrait: boolean;
  landscape: boolean;
}

export interface StationsByLine {
  [index: string]: Station[];
}

interface AppState {
  alertWizardOpen: boolean;
  alertData: any;
  modalOpen: boolean;
  modalDetails: ModalDetails;
  stationScreenOrientationList: StationsByLine;
}

export interface CannedMessage {
  type: "canned";
  id: number;
}

export interface CustomMessage {
  type: "custom";
  text: string;
}

interface Schedule {
  start: string;
  end: string;
}

interface AlertData {
  id: string;
  cleared_at: string;
  cleared_by: string;
  created_by: string;
  edited_by: string;
  message: CannedMessage | CustomMessage;
  schedule: Schedule;
  stations: string[];
  step: number | null;
}

class OutfrontTakeoverTool extends React.Component<
  Record<string, never>,
  AppState
> {
  constructor(props = {}) {
    super(props);
    this.state = {
      // TODO
      alertWizardOpen: false,
      alertData: null,
      modalOpen: false,
      modalDetails: {
        icon: <></>,
        header: "",
        description: "",
        cancelText: "",
        confirmJSX: <></>,
        onSubmit: this.toggleModal,
      },
      stationScreenOrientationList: {},
    };

    this.toggleAlertWizard = this.toggleAlertWizard.bind(this);
    this.openModal = this.openModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    fetch("/api/outfront_takeover_tool_screens")
      .then((response) => response.json())
      .then((result) =>
        this.setState({ stationScreenOrientationList: result })
      );

    document.title = "Outfront Media · Emergency Takeover";
  }

  toggleAlertWizard() {
    this.setState((state) => ({
      alertWizardOpen: !state.alertWizardOpen,
      modalOpen: false,
    }));
  }

  startAlertWizard() {
    this.setState({
      alertData: null,
      alertWizardOpen: true,
      modalOpen: false,
    });
  }

  startEditWizard(alertData: AlertData, step: number) {
    alertData.step = step;
    this.setState({
      alertData: alertData,
      alertWizardOpen: true,
      modalOpen: false,
    });
  }

  // The thought here is to allow a generic modal, which allows us to pass the content??  Sounds like an HOC
  openModal(modalDetails: ModalDetails) {
    this.setState({ modalDetails, modalOpen: true });
  }

  toggleModal() {
    this.setState((state) => ({
      modalOpen: !state.modalOpen,
    }));
  }

  render() {
    return (
      <StationScreenOrientationContext.Provider
        value={this.state.stationScreenOrientationList}
      >
        <div className="outfront-container">
          <div className="app-title">
            <img src="/images/t-identity.png" alt="Logo" className="logo" />
            <div className="stacked-title text-30">
              <div>Outfront Media screens</div>
              <div className="weight-700">Emergency Takeover</div>
            </div>
          </div>
          {this.state.alertWizardOpen ? (
            <AlertWizard
              triggerConfirmation={this.openModal}
              toggleAlertWizard={this.toggleAlertWizard.bind(this)}
              alertData={this.state.alertData}
              stationScreenOrientationList={
                this.state.stationScreenOrientationList
              }
            />
          ) : (
            <AlertDashboard
              startAlertWizard={this.startAlertWizard.bind(this)}
              startEditWizard={this.startEditWizard.bind(this)}
              triggerConfirmation={this.openModal}
              closeModal={this.toggleModal}
            />
          )}
        </div>
        <ConfirmationModal
          show={this.state.modalOpen}
          onHide={this.toggleModal}
          // onSubmit={this.toggleAlertWizard}
          modalDetails={this.state.modalDetails}
        />
      </StationScreenOrientationContext.Provider>
    );
  }
}

const StationScreenOrientationContext = createContext<StationsByLine>({
  red: [],
  orange: [],
  blue: [],
  silver: [],
  green: [],
});

export default OutfrontTakeoverTool;
export { AlertData, StationScreenOrientationContext };
