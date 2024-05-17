import React from "react";
import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";

export interface ModalDetails {
  icon: JSX.Element;
  header: string;
  description: string;
  cancelText: string;
  confirmJSX: JSX.Element;
  onSubmit: (...args: any) => void;
}

interface ModalProps {
  show: boolean;
  onHide: () => void;
  modalDetails: ModalDetails;
}

const ConfirmationModal = (props: ModalProps): JSX.Element => {
  const { icon, header, description, cancelText, confirmJSX, onSubmit } =
    props.modalDetails;
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="outfront-modal"
    >
      <Modal.Header className="text-30">
        <div className="icon-circle">{icon}</div>
        <Modal.Title>{header}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{description}</Modal.Body>
      <Modal.Footer>
        <button className="cancel-button" onClick={props.onHide}>
          {cancelText}
        </button>
        <button className="confirm-button" onClick={onSubmit}>
          {confirmJSX}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
