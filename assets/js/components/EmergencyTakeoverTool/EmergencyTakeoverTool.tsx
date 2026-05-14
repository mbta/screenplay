import React, { createContext } from "react";
import AlertDashboard from "./AlertDashboard/AlertDashboard";
import AlertWizard from "./AlertWizard/AlertWizard";
import { CannedMessagesProvider } from "./CannedMessagesContext";
import ConfirmationModal, { ModalDetails } from "./ConfirmationModal";
import { BASE_URL } from "Constants/constants";
import { Message } from "Utils/emergencyMessages";
import STATION_ORDER_BY_LINE from "Constants/stationOrder";

export interface Station {
  name: string;
  portrait: boolean;
  landscape: boolean;
  showtime_screen_ids: string[];
}

export interface StationsByLine {
  [index: string]: Station[];
}

interface AppState {
  alertWizardOpen: boolean;
  alertData: any;
  modalOpen: boolean;
  modalDetails: ModalDetails;
  stationScreenOrientationList: null | StationsByLine;
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
  message: Message;
  schedule: Schedule;
  stations: string[];
  step: number | null;
}

class EmergencyTakeoverTool extends React.Component<
  Record<string, never>,
  AppState
> {
  constructor(props = {}) {
    super(props);
    this.state = {
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
      stationScreenOrientationList: null,
    };

    fetch(`${BASE_URL}/stations_and_screens`)
      .then((response) => response.json())
      .then((stationsMap: { [stationName: string]: Station }) => {
        // Group stations by line
        const stationsByLine: StationsByLine = {};

        Object.keys(STATION_ORDER_BY_LINE).forEach((line) => {
          const stationInfo = STATION_ORDER_BY_LINE[line];
          if (stationInfo) {
            stationsByLine[line] = stationInfo
              .map((station) => stationsMap[station.name])
              .filter((station) => station !== undefined);
          }
        });

        this.setState({ stationScreenOrientationList: stationsByLine });
      });

    this.toggleAlertWizard = this.toggleAlertWizard.bind(this);
    this.openModal = this.openModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    document.title = "Emergency Takeover";
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
      !!this.state.stationScreenOrientationList && (
        <CannedMessagesProvider>
          <StationScreenOrientationContext.Provider
            value={this.state.stationScreenOrientationList}
          >
            <div className="emergency-container">
              <div className="app-title">
                <img src="/images/t-identity.png" alt="Logo" className="logo" />
                <div className="stacked-title text-30">
                  <div>Real-time Info Screens</div>
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
        </CannedMessagesProvider>
      )
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

export default EmergencyTakeoverTool;
export { AlertData, StationScreenOrientationContext };
