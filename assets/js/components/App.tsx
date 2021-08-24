import React from "react";
import AlertDashboard from "./AlertDashboard/AlertDashboard";
import AlertWizard from "./AlertWizard/AlertWizard";
import logo from '../../static/images/t-identity.png'

interface AppProps {
  name: string;
}

interface AppState {
  alertWizardOpen: boolean;
  alertId: string | null;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      // Temporarily set to true
      alertWizardOpen: true,
      alertId: null
    }
  };

  startAlertWizard() {
    this.setState({alertWizardOpen: true})
  }

  render() {
    return (
      <div className="app-container">
        <div className="app-title">
          <img src={logo} alt="Logo" className="logo"/>
          <div className="stacked-title text-30">
            <div>Outfront Media screens</div>
            <div className="weight-700">Emergency Takeover</div>
          </div>
        </div>
        { this.state.alertWizardOpen
          ? <AlertWizard/>
          : <AlertDashboard startAlertWizard={this.startAlertWizard.bind(this)}/>
        }
      </div>
    );
  }
};

export default App;