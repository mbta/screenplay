import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link45deg } from "react-bootstrap-icons";
import { useScreenplayDispatchContext } from "Hooks/useScreenplayContext";

interface CopyLinkButtonProps {
  url: string;
  queueToastExpiration: () => void;
}

const CopyLinkButton = (props: CopyLinkButtonProps): JSX.Element => {
  const dispatch = useScreenplayDispatchContext();

  return (
    <OverlayTrigger
      key="bottom"
      placement="bottom"
      overlay={<Tooltip>Copy Link</Tooltip>}
    >
      <Button
        data-testid="copy-link-button"
        className="screen-detail-action-bar-button copy-link-button"
        onClick={() => {
          navigator.clipboard.writeText(props.url);
          dispatch({ type: "SHOW_LINK_COPIED", showLinkCopied: true });
          props.queueToastExpiration();
        }}
      >
        <Link45deg className="copy-link-button__icon" />
      </Button>
    </OverlayTrigger>
  );
};

export default CopyLinkButton;
