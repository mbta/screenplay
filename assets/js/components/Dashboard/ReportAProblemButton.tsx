import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { FlagFill } from "react-bootstrap-icons";

interface ReportAProblemButtonProps {
  url: string;
}

const ReportAProblemButton = (
  props: ReportAProblemButtonProps,
): JSX.Element => {
  return (
    <Button
      data-testid="report-a-problem"
      className="screen-detail-action-bar-button report-a-problem-button"
      href={props.url}
      onClick={(e: SyntheticEvent) => e.stopPropagation()}
      target="_blank"
    >
      <FlagFill className="report-a-problem-button__icon" /> Report a problem
    </Button>
  );
};

export default ReportAProblemButton;
