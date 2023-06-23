import React, { SyntheticEvent } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";

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
        className="screen-detail-action-bar-button open-in-tab-button"
        href={props.url}
        onClick={(e: SyntheticEvent) => e.stopPropagation()}
        target="_blank"
      >
        <BoxArrowUpRight className="open-in-tab-button__icon" />
      </Button>
    </OverlayTrigger>
  );
};

export default OpenInTabButton;
