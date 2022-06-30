import React from "react";
import { Screen } from "../../models/screen";
import ReportAProblemButton from "./ReportAProblemButton";

interface ScreenDetailProps {
  screen: Screen;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const { id, type } = props.screen;
  return (
    <div className="screen-detail__container">
      <div className="screen-detail__screen-type-location">
        {type} / Location
      </div>
      <div className="screen-detail__report-a-problem-button">
        <ReportAProblemButton id={id} />
      </div>
    </div>
  );
};

export default ScreenDetail;
