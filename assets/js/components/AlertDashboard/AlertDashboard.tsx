import React, { useEffect, useState } from "react";
import AlertsList from "./AlertsList";
import IntroBlock from "./IntroBlock";
import { AlertData } from "../App";
import { ModalDetails } from "../ConfirmationModal";
import AlertsHistory from "./AlertsHistory";

interface AlertDashboardProps {
  startAlertWizard: () => void;
  startEditWizard: (data: AlertData) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void;
  closeModal: () => void;
}

const AlertDashboard = (props: AlertDashboardProps): JSX.Element => {
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());

  useEffect(() => {
    setTimeout(() => setLastChangeTime(Date.now()), 60000);
  }, [lastChangeTime]);

  return (
    <>
      <IntroBlock startAlertWizard={props.startAlertWizard} />
      <AlertsList
        lastChangeTime={lastChangeTime}
        setLastChangeTime={setLastChangeTime}
        startEditWizard={props.startEditWizard}
        triggerConfirmation={props.triggerConfirmation}
        closeModal={props.closeModal}
      />
      <AlertsHistory lastChangeTime={lastChangeTime} setLastChangeTime={setLastChangeTime} />
      <footer>© 2021 – Massachusetts Bay Transportation Authority</footer>
    </>
  );
};

export default AlertDashboard;
