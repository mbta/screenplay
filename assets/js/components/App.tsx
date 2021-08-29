import React from "react";
import AlertDashboard from "./AlertDashboard/AlertDashboard";
import AlertWizard from "./AlertWizard/AlertWizard";
import logo from '../../static/images/t-identity.png'
import ConfirmationModal from "./ConfirmationModal";

interface AppProps {
  name: string;
}

interface AppState {
  alertWizardOpen: boolean;
  alertData: any;
  modalOpen: boolean;
  modalContent: JSX.Element;
}

interface CannedMessage {
  type: "canned";
  id: number;
}

interface CustomMessage {
  type: "custom";
  text: string;
}

interface Schedule {
  start: string;
  end: string;
}

interface AlertData {
  id: string;
  created_by: string;
  edited_by: string;
  message: CannedMessage | CustomMessage;
  schedule: Schedule;
  stations: string[];
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      alertWizardOpen: false,
      alertData: null,
      modalOpen: false,
      modalContent: <></>
    }

    this.toggleAlertWizard = this.toggleAlertWizard.bind(this)
    this.openModal = this.openModal.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  };

  toggleAlertWizard() {
    this.setState(state => ({
      alertWizardOpen: !state.alertWizardOpen,
      modalOpen: false
    }))
  }

  startAlertWizard() {
    this.setState(state => ({
      alertData: null,
      alertWizardOpen: true,
      modalOpen: false
    }))
  }

  startEditWizard(alertData: AlertData) {
    console.log(alertData)

    this.setState(state => ({
      alertData: alertData,
      alertWizardOpen: true,
      modalOpen: false
    }))
  }

  // The thought here is to allow a generic modal, which allows us to pass the content??  Sounds like an HOC
  openModal(modal: JSX.Element) {
    this.setState({modalContent: modal, modalOpen: true})
  }

  toggleModal() {
    this.setState(state => ({
      modalOpen: !state.modalOpen
    })) 
  }


  render() {
    return (
      <>
        <div className="app-container">
          <div className="app-title">
            <img src={logo} alt="Logo" className="logo"/>
            <div className="stacked-title text-30">
              <div>Outfront Media screens</div>
              <div className="weight-700">Emergency Takeover</div>
            </div>
          </div>
          { this.state.alertWizardOpen
            ? <AlertWizard triggerConfirmation={ this.openModal } toggleAlertWizard={this.toggleAlertWizard.bind(this)} alertData={this.state.alertData} />
            : <AlertDashboard startAlertWizard={this.startAlertWizard.bind(this)} startEditWizard={this.startEditWizard.bind(this)} />
          }
        </div>
        <ConfirmationModal
          show={this.state.modalOpen}
          onHide={this.toggleModal}
          onSubmit={this.toggleAlertWizard}
        />
      </>
    );
  }
};

export default App;
export { AlertData };
