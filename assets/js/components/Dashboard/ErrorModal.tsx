import React from "react";
import { Button, Modal } from "react-bootstrap";

interface ErrorModalProps {
  title: string;
  showErrorModal: boolean;
  onHide: () => void;
  errorMessage: string;
  confirmButtonLabel: string;
  onConfirm: () => void;
}

const ErrorModal = ({
  title,
  showErrorModal,
  onHide,
  errorMessage,
  confirmButtonLabel,
  onConfirm,
}: ErrorModalProps) => {
  return (
    <Modal
      show={showErrorModal}
      className="error-modal"
      backdrop="static"
      onHide={onHide}
    >
      <Modal.Header closeButton closeVariant="white">
        {title && <Modal.Title>{title}</Modal.Title>}
      </Modal.Header>
      <Modal.Body>{errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} className="error-modal__cancel-button">
          Cancel
        </Button>
        <Button className="error-modal__refresh-button" onClick={onConfirm}>
          {confirmButtonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
