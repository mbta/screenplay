import React from "react";
import ReportAProblemButton from "./ReportAProblemButton";
import CopyLinkButton from "./CopyLinkButton";
import OpenInWindowButton from "./OpenInTabButton";
import Dropdown from "react-bootstrap/Dropdown";
import { Button } from "react-bootstrap";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { Link45deg } from "react-bootstrap-icons";
import { FlagFill } from "react-bootstrap-icons";

interface ScreenDetailActionBarProps {
  screenUrl: string;
  isPaess?: boolean;
}

type CustomToggleProps = {
  children?: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {};
};

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef(
  (props: CustomToggleProps, ref: React.Ref<HTMLButtonElement>) => (
    <Button
      className="three-dots-vertical-button"
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        props.onClick(e);
      }}
    >
      <ThreeDotsVertical className="three-dots-vertical-icon" />
      {props.children}
    </Button>
  )
);

const ScreenDetailActionBar = (
  props: ScreenDetailActionBarProps
): JSX.Element => {
  let actionBar;
  if (props.isPaess) {
    actionBar = (
      <Dropdown className="three-dots-vertical-dropdown">
        <Dropdown.Toggle as={CustomToggle} />
        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">
            <BoxArrowUpRight className="open-in-tab-icon" /> Open in new tab
          </Dropdown.Item>
          <Dropdown.Item href="#/action-2">
            <Link45deg className="copy-link-icon" /> Copy link
          </Dropdown.Item>
          <Dropdown.Item href="#/action-3">
            <FlagFill /> Report a problem
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  } else {
    actionBar = (
      <div>
        <OpenInWindowButton url={props.screenUrl} />
        <CopyLinkButton url={props.screenUrl} />
        <ReportAProblemButton />
      </div>
    );
  }

  return actionBar;
};

export default ScreenDetailActionBar;
