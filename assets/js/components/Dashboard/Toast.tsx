import React from "react";
import { Toast as BSToast, ToastContainer } from "react-bootstrap";
import {
  CheckCircleFill,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import { classWithModifier } from "../../util";

export type ToastProps = {
  variant: "warning" | "info";
  message: string | null;
  errors?: string[];
  onClose?: () => void;
  autoHide?: boolean;
};

const Toast = ({
  message,
  errors = [],
  onClose,
  variant,
  autoHide,
}: ToastProps) => {
  const getErrorMessageFromField = (error: string) => {
    switch (error) {
      case "sign_ids":
        return "Add Stations & Zones";
      case "visual_text":
        return "Visual Text";
      case "audio_text":
        return "Phonetic Audio";
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
      <BSToast
        show={message !== null}
        onClose={onClose}
        delay={5000}
        autohide={autoHide}
      >
        <BSToast.Header className={classWithModifier("toast", variant)}>
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
        </BSToast.Header>
      </BSToast>
    </ToastContainer>
  );
};

export default Toast;
