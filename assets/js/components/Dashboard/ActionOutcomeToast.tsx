import React from "react";
import Toast from "react-bootstrap/Toast";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import classNames from "classnames";

interface ActionOutcomeToastProps {
  show: boolean;
  isSuccessful?: boolean;
  message?: string;
}

const ActionOutcomeToast = ({
  show,
  isSuccessful = true,
  message,
}: ActionOutcomeToastProps): JSX.Element => {
  const toastClass = classNames({
    "action-outcome-toast": true,
    "action-outcome-toast--success": isSuccessful,
    "action-outcome-toast--failure": !isSuccessful,
  });

  const Icon = isSuccessful ? CheckCircleFill : ExclamationTriangleFill;

  return (
    <Toast bg="warning" show={show} animation={true} className={toastClass}>
      <Toast.Body>
        <Icon className="action-outcome-toast__icon" /> {message}
      </Toast.Body>
    </Toast>
  );
};

export type { ActionOutcomeToastProps };
export default ActionOutcomeToast;
