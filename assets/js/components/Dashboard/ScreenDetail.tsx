import React from "react";
import { Button } from "react-bootstrap";
import { FlagFill } from "react-bootstrap-icons";
import { Screen } from "../../models/screen";

interface ScreenDetailProps {
  screen: Screen;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const { type } = props.screen;
  return (
    <div className="screen-detail__container">
      <div className="screen-detail__screen-type-location">
        {type} / Location
      </div>
      <div className="screen-detail__report-a-problem-button">
        <Button>
          <FlagFill /> Report a problem
        </Button>
      </div>
    </div>
  );
};

export default ScreenDetail;
