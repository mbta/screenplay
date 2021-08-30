import React from "react";
import AlertsList from "./AlertsList";
import IntroBlock from "./IntroBlock";
import { AlertData } from "../App";
import { ModalDetails } from "../ConfirmationModal";

interface AlertDashboardProps {
  startAlertWizard: () => void;
  startEditWizard: (data: AlertData) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void
  closeModal: () => void
}

const AlertDashboard = (props: AlertDashboardProps): JSX.Element => {
  return (
    <>
      <IntroBlock startAlertWizard={props.startAlertWizard} />
      <AlertsList
        startEditWizard={props.startEditWizard}
        triggerConfirmation={props.triggerConfirmation}
        closeModal={props.closeModal}/>
      <footer>© 2021 – Massachusetts Bay Transportation Authority</footer>
    </>
  );
};

export default AlertDashboard;
