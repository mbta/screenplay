import React from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface ModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
  //children: JSX.Element;
}

const ConfirmationModal = (props: ModalProps): JSX.Element => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Cancel new Takeover Alert
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Canceling now will lose any progress you have made.
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Never mind</Button>
        <Button onClick={props.onSubmit}>Confirm cancelation</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal