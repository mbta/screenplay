import React from "react";
import { Screen } from "../../models/screen";
import ReportAProblemButton from "./ReportAProblemButton";
import { SCREEN_TYPES } from "../../constants/constants";

interface ScreenDetailProps {
  screens: Screen[];
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const translateScreenType = () => {
    return SCREEN_TYPES.find(({ ids }) => ids.includes(props.screens[0].type))
      ?.label;
  };

  return (
    <div className="screen-detail__container">
      <div className="screen-detail__header">
        <div className="screen-detail__screen-type-location">
          {translateScreenType()} / Location
        </div>
        <div className="screen-detail__report-a-problem-button">
          <ReportAProblemButton />
        </div>
      </div>
      <div>
        {props.screens.map((screen) => (
          <div key={screen.id}>{screen.id}</div>
        ))}
      </div>
    </div>
  );
};

export default ScreenDetail;
