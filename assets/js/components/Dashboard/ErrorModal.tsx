import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useErrorState } from "Hooks/useErrorState";
import { clearErrorState } from "Utils/errorHandler";

interface ErrorModalProps {
  className?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = () => {
  const { errorState } = useErrorState();

  return (
    <Modal
      show={errorState !== null}
      className="error-modal"
      backdrop="static"
      onHide={clearErrorState}
    >
      <Modal.Header closeButton closeVariant="white">
        {errorState?.title && <Modal.Title>{errorState?.title}</Modal.Title>}
      </Modal.Header>
      <Modal.Body>{errorState?.messageToDisplay}</Modal.Body>
      <Modal.Footer>
        <Button onClick={clearErrorState} className="error-modal__cancel-button">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
