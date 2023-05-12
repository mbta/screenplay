import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface OpenInTabButtonProps {
  url: string;
}

const OpenInTabButton = (props: OpenInTabButtonProps): JSX.Element => {
  return (
    <OverlayTrigger
      key="bottom"
      placement="bottom"
      overlay={<Tooltip>Open in new tab</Tooltip>}
    >
      <Button
        data-testid="open-in-tab"
        className="open-in-tab-button"
        href={props.url}
        onClick={(e: SyntheticEvent) => e.stopPropagation()}
        target="_blank"
      >
        <BoxArrowUpRight className="open-in-tab-icon" />
      </Button>
    </OverlayTrigger>
  );
};

export default OpenInTabButton;
