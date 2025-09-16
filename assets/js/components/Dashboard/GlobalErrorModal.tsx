import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { 
  subscribeToGlobalError, 
  getGlobalError, 
  clearGlobalError,
  GlobalErrorState 
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
      className={`global-error-modal ${className || ''}`}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="text-danger">
          <i className="fas fa-exclamation-triangle me-2" />
          {errorState.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-start">
          <i className="fas fa-exclamation-circle text-danger me-3 mt-1" />
          <div>
            <p className="mb-0">{errorState.message}</p>
            {errorState.onRetry && (
              <p className="text-muted small mt-2 mb-0">
                You can try again or contact support if the problem persists.
              </p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleDismiss}
          className="global-error-modal__dismiss-button"
        >
          Dismiss
        </Button>
        {errorState.onRetry && (
          <Button 
            variant="primary" 
            onClick={handleRetry}
            className="global-error-modal__retry-button"
          >
            <i className="fas fa-redo me-2" />
            Try Again
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GlobalErrorModal;
