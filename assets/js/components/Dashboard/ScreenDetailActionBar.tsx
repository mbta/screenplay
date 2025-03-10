import React, { SyntheticEvent } from "react";
import ReportAProblemButton from "Components/ReportAProblemButton";
import CopyLinkButton from "Components/CopyLinkButton";
import OpenInWindowButton from "Components/OpenInTabButton";
import { Dropdown } from "react-bootstrap";
import { Link45deg, FlagFill, BoxArrowUpRight } from "react-bootstrap-icons";
import { useScreenplayDispatchContext } from "Hooks/useScreenplayContext";
import KebabMenu from "Components/KebabMenu";
import { isEmergencyAdmin } from "Utils/auth";

interface ScreenDetailActionBarProps {
  screenUrl: string;
  isCollapsed?: boolean;
}

const ScreenDetailActionBar = (
  props: ScreenDetailActionBarProps,
): JSX.Element => {
  const dispatch = useScreenplayDispatchContext();

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

  const reportAProblemURL = isEmergencyAdmin()
    ? "https://mbta.slack.com/channels/oio-mbta-collab"
    : "https://mbta.slack.com/channels/tid-screens-team";

  let actionBar;

  if (props.isCollapsed) {
    actionBar = (
      <KebabMenu tooltipText="Copy, report and more">
        <Dropdown.Item
          className="kebab-menu-dropdown__item"
          href={props.screenUrl}
          target="_blank"
          onClick={(e: SyntheticEvent) => e.stopPropagation()}
        >
          <BoxArrowUpRight className="open-in-tab-button__icon" /> Open in new
          tab
        </Dropdown.Item>
        <Dropdown.Item
          className="kebab-menu-dropdown__item"
          onClick={() => {
            navigator.clipboard.writeText(props.screenUrl);
            dispatch({ type: "SHOW_LINK_COPIED", showLinkCopied: true });
            queueToastExpiration();
          }}
        >
          <Link45deg className="copy-link-button__icon" /> Copy link
        </Dropdown.Item>
        <Dropdown.Item
          className="kebab-menu-dropdown__item"
          href={reportAProblemURL}
          onClick={(e: SyntheticEvent) => e.stopPropagation()}
          target="_blank"
        >
          <FlagFill className="report-a-problem-button__icon" /> Report a
          problem
        </Dropdown.Item>
      </KebabMenu>
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
