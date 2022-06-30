import React from "react";
import { Screen } from "../../models/screen";
import ReportAProblemButton from "./ReportAProblemButton";
import { SCREEN_TYPES } from "../../constants/constants";

interface ScreenDetailProps {
  screen: Screen;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const { id, type } = props.screen;

  const translateScreenType = () => {
    return SCREEN_TYPES.find(({ ids }) => ids.includes(type))?.label;
  };

  return (
    <div className="screen-detail__container">
      <div className="screen-detail__screen-type-location">
        {translateScreenType()} / Location
      </div>
      <div className="screen-detail__report-a-problem-button">
        <ReportAProblemButton id={id} />
      </div>
    </div>
  );
};

export default ScreenDetail;
