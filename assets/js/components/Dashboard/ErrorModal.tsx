import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import {
  clearErrorState,
  getErrorState,
  subscribeToError,
  ErrorState,
} from "Utils/errorHandler";

interface ErrorModalProps {
  className?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = () => {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const subscribe = subscribeToError((error) => {
    setErrorState(error);
  });

  useEffect(() => {
    // Set initial state
    setErrorState(getErrorState());
    return subscribe;
  }, [errorState, subscribe]);

  const handleDismiss = () => {
    if (errorState?.onDismiss) {
      errorState.onDismiss();
    }
    clearErrorState();
  };

  const handleRetry = () => {
    if (errorState?.onRetry) {
      errorState.onRetry();
    }
    clearErrorState();
  };

  if (!errorState?.show) {
    return null;
  }

  return (
    <Modal
      show={errorState.show}
      className="error-modal"
      backdrop="static"
      onHide={handleDismiss}
    >
      <Modal.Header closeButton closeVariant="white">
        {errorState.title && <Modal.Title>{errorState.title}</Modal.Title>}
      </Modal.Header>
      <Modal.Body>{errorState.messageToDisplay}</Modal.Body>
      <Modal.Footer>
        <Button onClick={handleDismiss} className="error-modal__cancel-button">
          Cancel
        </Button>
        {errorState.onRetry && (
          <Button className="error-modal__refresh-button" onClick={handleRetry}>
            Refresh
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
