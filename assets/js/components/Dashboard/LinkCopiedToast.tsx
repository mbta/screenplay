import React from "react";
import Toast from "react-bootstrap/Toast";
import { CheckCircleFill } from "react-bootstrap-icons";

interface LinkCopiedToastProps {
  show: boolean;
}

const LinkCopiedToast = (props: LinkCopiedToastProps): JSX.Element => {
  return (
    <Toast show={props.show} animation={true} className="link-copied-toast">
      <Toast.Body>
        <CheckCircleFill className="link-copied-toast__icon" /> Link copied to
        clipboard
      </Toast.Body>
    </Toast>
  );
};

export default LinkCopiedToast;
