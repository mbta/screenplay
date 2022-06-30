import React, { SyntheticEvent } from "react";
import { Button } from "react-bootstrap";
import { FlagFill } from "react-bootstrap-icons";

interface ReportAProblemButtonProps {
  id: string;
}

const ReportAProblemButton = (
  props: ReportAProblemButtonProps
): JSX.Element => {
  const reportAProblem = (e: SyntheticEvent) => {
    e.stopPropagation();
    console.log(`Problem reported for screen ${props.id}`);
  };

  return (
    <div className="report-a-problem-button">
      <Button onClick={reportAProblem}>
        <FlagFill /> Report a problem
      </Button>
    </div>
  );
};

export default ReportAProblemButton;
