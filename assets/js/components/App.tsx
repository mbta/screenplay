import React from "react";
import AlertDashboard from "./AlertDashboard";
import AlertWizard from "./AlertWizard";
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
      alertWizardOpen: false,
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
          <div className="stacked-title">
            <div>Outfront Media screens</div>
            <div className="bold">Emergency Takeover</div>
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