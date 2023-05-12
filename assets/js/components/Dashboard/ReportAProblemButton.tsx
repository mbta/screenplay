import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { FlagFill } from "react-bootstrap-icons";

const ReportAProblemButton = (): JSX.Element => {
  const isAdmin = document.querySelector("meta[name=is-admin]");

  const link = isAdmin
    ? "https://mbta.slack.com/channels/screens-team-pios"
    : "https://mbta.slack.com/channels/screens";

  return (
    <Button
      data-testid="report-a-problem"
      className="report-a-problem-button"
      href={link}
      onClick={(e: SyntheticEvent) => e.stopPropagation()}
      target="_blank"
    >
      <FlagFill /> Report a problem
    </Button>
  );
};

export default ReportAProblemButton;
