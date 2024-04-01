import React, { useRef, useEffect, useState, SyntheticEvent } from "react";
import ReportAProblemButton from "./ReportAProblemButton";
import CopyLinkButton from "./CopyLinkButton";
import OpenInWindowButton from "./OpenInTabButton";
import { Button, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Link45deg,
  FlagFill,
  BoxArrowUpRight,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { useScreenplayDispatchContext } from "../../hooks/useScreenplayContext";

interface ScreenDetailActionBarProps {
  screenUrl: string;
  isCollapsed?: boolean;
}

type CustomToggleProps = {
  children?: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
};

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the dropdown menu
const CustomToggle = React.forwardRef(
  (props: CustomToggleProps, ref: React.Ref<HTMLButtonElement>) => (
    <OverlayTrigger
      key="bottom"
      placement="bottom"
      overlay={<Tooltip>Copy, report and more</Tooltip>}
    >
      <Button
        className="screen-detail-action-bar-button three-dots-vertical-button"
        href=""
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          props.onClick(e);
        }}
      >
        <ThreeDotsVertical className="three-dots-vertical-button__icon" />
        {props.children}
      </Button>
    </OverlayTrigger>
  ),
);

const ScreenDetailActionBar = (
  props: ScreenDetailActionBarProps,
): JSX.Element => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dispatch = useScreenplayDispatchContext();

  // For handling clicking outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const queueToastExpiration = () => {
    setTimeout(
      () =>
        dispatch({
          type: "SHOW_LINK_COPIED",
          showLinkCopied: false,
        }),
      5000,
    );
  };

  const isEmergencyAdmin = document.querySelector(
    "meta[name=is-emergency-admin]"
  );

  const reportAProblemURL = isEmergencyAdmin
    ? "https://mbta.slack.com/channels/screens-team-pios"
    : "https://mbta.slack.com/channels/screens";

  let actionBar;

  if (props.isCollapsed) {
    actionBar = (
      <Dropdown
        className="three-dots-vertical-dropdown"
        show={isOpen}
        ref={dropdownRef}
        drop={"down"}
      >
        <Dropdown.Toggle as={CustomToggle} onClick={() => setIsOpen(!isOpen)} />
        <Dropdown.Menu className="three-dots-vertical-dropdown__menu">
          <Dropdown.Item
            className="three-dots-vertical-dropdown__item"
            href={props.screenUrl}
            target="_blank"
            onClick={(e: SyntheticEvent) => e.stopPropagation()}
          >
            <BoxArrowUpRight className="open-in-tab-button__icon" /> Open in new
            tab
          </Dropdown.Item>
          <Dropdown.Item
            className="three-dots-vertical-dropdown__item"
            onClick={() => {
              navigator.clipboard.writeText(props.screenUrl);
              dispatch({ type: "SHOW_LINK_COPIED", showLinkCopied: true });
              queueToastExpiration();
            }}
          >
            <Link45deg className="copy-link-button__icon" /> Copy link
          </Dropdown.Item>
          <Dropdown.Item
            className="three-dots-vertical-dropdown__item"
            href={reportAProblemURL}
            onClick={(e: SyntheticEvent) => e.stopPropagation()}
            target="_blank"
          >
            <FlagFill className="report-a-problem-button__icon" /> Report a
            problem
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  } else {
    actionBar = (
      <div>
        <OpenInWindowButton url={props.screenUrl} />
        <CopyLinkButton
          url={props.screenUrl}
          queueToastExpiration={queueToastExpiration}
        />
        <ReportAProblemButton url={reportAProblemURL} />
      </div>
    );
  }

  return actionBar;
};

export default ScreenDetailActionBar;
