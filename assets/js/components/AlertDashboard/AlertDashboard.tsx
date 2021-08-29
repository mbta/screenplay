import React from "react";
import AlertsList from "./AlertsList";
import IntroBlock from "./IntroBlock";
import { AlertData } from "../App";

interface AlertDashboardProps {
  startAlertWizard: () => void;
  startEditWizard: (data: AlertData) => void;
}

const AlertDashboard = (props: AlertDashboardProps): JSX.Element => {
  return (
    <>
      <IntroBlock startAlertWizard={props.startAlertWizard} />
      <AlertsList startEditWizard={props.startEditWizard} />
      <footer></footer>
    </>
  );
};

export default AlertDashboard;
