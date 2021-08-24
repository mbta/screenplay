import React from 'react';
import AlertsList from './AlertsList';
import IntroBlock from './IntroBlock';

interface AlertDashboardProps {
  startAlertWizard: () => void;
}

const AlertDashboard = (props: AlertDashboardProps): JSX.Element => {
  return (
    <>
      <IntroBlock startAlertWizard={props.startAlertWizard}/>
      <AlertsList/>
      <footer></footer>
    </>
  )
}

export default AlertDashboard;