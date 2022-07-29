import React from "react";
import { Screen } from "../../models/screen";
import ReportAProblemButton from "./ReportAProblemButton";
import { SCREEN_TYPES } from "../../constants/constants";

interface ScreenDetailProps {
  screens: Screen[];
  isOpen: boolean;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const translateScreenType = () => {
    return SCREEN_TYPES.find(({ ids }) => ids.includes(props.screens[0].type))
      ?.label;
  };

  const generateSource = (screen: Screen) => {
    const { id, type } = screen;
    // @ts-ignore Suppressing "object could be null" warning
    const { environmentName } = document.getElementById("app").dataset;
    const baseUrl =
      environmentName === "dev"
        ? "https://screens-dev.mbtace.com"
        : "https://screens.mbta.com";

    switch (type) {
      case "bus_shelter_v2":
      case "gl_eink_v2":
      case "bus_eink_v2":
      case "pre_fare_v2":
        return `${baseUrl}/v2/screen/${id}/simulation`;

      case "dup":
        return `${baseUrl}/screen/${id}/simulation`;
      default:
        return "";
    }
  };

  return (
    <div className="screen-detail__container">
      <div className="screen-detail__header">
        <div className="screen-detail__screen-type-location">
          {translateScreenType()} / Location
        </div>
        {props.screens[0].type === "dup" && (
          <div className="screen-detail__dup-ad-text">
            Cycle in the ad loop for 7.5 seconds every 45 seconds
          </div>
        )}
        <div className="screen-detail__report-a-problem-button">
          <ReportAProblemButton />
        </div>
      </div>
      {props.isOpen &&
        props.screens.map((screen) => (
          <div
            key={screen.id}
            className={`screen-detail__iframe-container screen-detail__iframe-container--${screen.type}`}
          >
            <iframe
              className={`screen-detail__iframe screen-detail__iframe--${screen.type}`}
              title={screen.id}
              src={generateSource(screen)}
            />
          </div>
        ))}
    </div>
  );
};

export default ScreenDetail;
