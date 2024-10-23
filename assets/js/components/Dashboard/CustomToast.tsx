import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import { classWithModifier } from "../../util";

interface CustomToastProps {
  variant: "warning" | "info";
  message: string | null;
  errors?: string[];
  onClose: () => void;
}

const CustomToast = ({
  message,
  errors = [],
  onClose,
  variant,
}: CustomToastProps) => {
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

  const Icon =
    variant === "warning" ? ExclamationTriangleFill : CheckCircleFill;

  return (
    <ToastContainer position="bottom-center" className="toast-container">
      <Toast
        show={message != null}
        onClose={onClose}
        delay={5000}
        autohide={true}
      >
        <Toast.Header className={classWithModifier("toast", variant)}>
          {<Icon className="toast__icon" />}
          <div className="toast__text">
            {message}
            {errors.length > 0 && (
              <ul>
                {errors.map((error, i) => {
                  return <li key={i}>{getErrorMessageFromField(error)}</li>;
                })}
              </ul>
            )}
          </div>
        </Toast.Header>
      </Toast>
    </ToastContainer>
  );
};

export default CustomToast;
