import React, { ComponentType } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";
import "../../../../css/screenplay.scss";

interface BottomActionBarProps {
  backButtonLabel?: string;
  forwardButtonLabel?: string;
  cancelButtonLabel?: string;
  onBack?: () => void;
  onForward?: () => void;
  onCancel?: () => void;
}

const BottomActionBar: ComponentType<BottomActionBarProps> = ({
  backButtonLabel,
  forwardButtonLabel,
  cancelButtonLabel,
  onBack,
  onForward,
  onCancel,
}: BottomActionBarProps) => {
  return (
    <Navbar variant="dark" data-bs-theme="dark">
      <Container className="bottom-action-bar-container">
        {cancelButtonLabel && (
          <Button onClick={onCancel} className="cancel" variant="link">
            {cancelButtonLabel}
          </Button>
        )}
        {backButtonLabel && (
          <Button onClick={onBack}>
            <ArrowLeft className="bottom-action-bar-container__icon" />
            {backButtonLabel}
          </Button>
        )}
        {forwardButtonLabel && (
          <Button onClick={onForward} className="forward">
            {forwardButtonLabel}
            <ArrowRight className="bottom-action-bar-container__icon" />
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default BottomActionBar;
