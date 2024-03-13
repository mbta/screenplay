import React from "react";
import Toast from "react-bootstrap/Toast";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import classNames from "classnames";

interface PublishOutcomeToastProps {
  show: boolean;
  isSuccessful?: boolean;
  message?: string;
}

const PublishOutcomeToast = ({
  show,
  isSuccessful = true,
  message,
}: PublishOutcomeToastProps): JSX.Element => {
  const toastClass = classNames({
    "publish-outcome-toast": true,
    "publish-outcome-toast--success": isSuccessful,
    "publish-outcome-toast--failure": !isSuccessful,
  });

  const Icon = isSuccessful ? CheckCircleFill : ExclamationTriangleFill;

  return (
    <Toast bg="warning" show={show} animation={true} className={toastClass}>
      <Toast.Body>
        <Icon className="publish-outcome-toast__icon" /> {message}
      </Toast.Body>
    </Toast>
  );
};

export type { PublishOutcomeToastProps };
export default PublishOutcomeToast;
