import React from "react";
import { Alert } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";

interface Props {
  errorMessage: string;
  errors: string[];
  onClose: () => void;
}

const ErrorToast = ({ errorMessage, errors, onClose }: Props) => {
  const getErrorMessageFromField = (error: string) => {
    switch (error) {
      case "sign_ids":
        return "Add Stations & Zones";
      case "visual_text":
        return "Visual Text";
      case "audio_text":
        return "Phoentic Audio";
      case "start_datetime":
        return "Start date/time";
      case "end_datetime":
        return "End date/time";
      default:
        return "";
    }
  };

  return (
    <div className="error-alert-container">
      <Alert
        show={errorMessage.length > 0}
        variant="primary"
        onClose={onClose}
        dismissible
        className="error-alert"
      >
        <ExclamationTriangleFill className="error-alert__icon" />
        <div className="error-alert__text">
          {errorMessage}
          {errors.length > 0 && (
            <ul>
              {errors.map((error, i) => {
                return <li key={i}>{getErrorMessageFromField(error)}</li>;
              })}
            </ul>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default ErrorToast;
