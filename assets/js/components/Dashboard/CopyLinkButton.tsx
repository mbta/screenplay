import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { Link45deg } from "react-bootstrap-icons";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface CopyLinkButtonProps {
  url: string;
}

const CopyLinkButton = (props: CopyLinkButtonProps): JSX.Element => {
  return (
    <OverlayTrigger
      key="bottom"
      placement="bottom"
      overlay={<Tooltip>Copy Link</Tooltip>}
    >
      <Button
        data-testid="copy-link-button"
        className="copy-link-button"
        onClick={() => {
          navigator.clipboard.writeText(props.url);
        }}
      >
        <Link45deg className="copy-link-icon" />
      </Button>
    </OverlayTrigger>
  );
};

export default CopyLinkButton;
