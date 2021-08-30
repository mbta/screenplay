import React from "react";
import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";

export interface ModalDetails {
  icon: JSX.Element,
  header: string,
  description: string,
  cancelText: string,
  confirmJSX: JSX.Element,
  onSubmit: (...args: any) => void
}

interface ModalProps {
  show: boolean;
  onHide: () => void;
  modalDetails: ModalDetails;
}

const ConfirmationModal = (props: ModalProps): JSX.Element => {
  const { icon, header, description, cancelText, confirmJSX, onSubmit } = props.modalDetails
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        <div className="modal-header">
          <div className="icon-circle">{icon}</div>
          <div className="header-text">{header}</div>
        </div>
        <div className="modal-description">{description}</div>
      </Modal.Body>
      <Modal.Footer>
        <button className="cancel-button" onClick={props.onHide}>{cancelText}</button>
        <button className="confirm-button" onClick={onSubmit}>{confirmJSX}</button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
