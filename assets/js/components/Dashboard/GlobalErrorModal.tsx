import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import {
  subscribeToGlobalError,
  getGlobalError,
  clearGlobalError,
  GlobalErrorState,
} from "Utils/errorHandler";

interface GlobalErrorModalProps {
  className?: string;
}

const GlobalErrorModal: React.FC<GlobalErrorModalProps> = ({ className }) => {
  const [errorState, setErrorState] = useState<GlobalErrorState | null>(null);

  useEffect(() => {
    // Subscribe to global error state changes
    const unsubscribe = subscribeToGlobalError((error) => {
      setErrorState(error);
    });

    // Set initial state
    setErrorState(getGlobalError());

    return unsubscribe;
  }, []);

  const handleDismiss = () => {
    if (errorState?.onDismiss) {
      errorState.onDismiss();
    }
    clearGlobalError();
  };

  const handleRetry = () => {
    if (errorState?.onRetry) {
      errorState.onRetry();
    }
    clearGlobalError();
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

export default GlobalErrorModal;
