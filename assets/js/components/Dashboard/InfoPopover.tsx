import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { InfoCircleFill } from "react-bootstrap-icons";
import { type Placement } from "react-bootstrap/esm/types";
import * as infoPopoverStyles from "Styles/info-popover.module.scss";

interface Props {
  popoverText: string;
  placement: Placement;
}

const InfoPopover = ({ popoverText, placement }: Props) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Popover id="info-popover" className={infoPopoverStyles.popover} body>
          {popoverText}
        </Popover>
      }
    >
      <InfoCircleFill fill="#8ECDFF" />
    </OverlayTrigger>
  );
};

export default InfoPopover;
