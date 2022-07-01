import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { FlagFill } from "react-bootstrap-icons";

const ReportAProblemButton = (): JSX.Element => {
  return (
    <div className="report-a-problem-button">
      <Button
        href="https://mbta.slack.com/channels/screens"
        onClick={(e: SyntheticEvent) => e.stopPropagation()}
        target="_blank"
      >
        <FlagFill /> Report a problem
      </Button>
    </div>
  );
};

export default ReportAProblemButton;
