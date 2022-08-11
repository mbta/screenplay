import React from "react";
import { Screen } from "../../models/screen";
import ReportAProblemButton from "./ReportAProblemButton";
import { SCREEN_TYPES } from "../../constants/constants";
import PaessDetailContainer from "./PaessDetailContainer";
import classNames from "classnames";

interface ScreenDetailProps {
  screens: Screen[];
  isOpen: boolean;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const translateScreenType = () => {
    return SCREEN_TYPES.find(({ ids }) => ids.includes(props.screens[0].type))
      ?.label;
  };

  const isPaess = props.screens.every((screen) => screen.type === "pa_ess");

  const getPaessRouteLetter = () => {
    return props.screens[0].station_code
      ? props.screens[0].station_code.charAt(0).toLowerCase()
      : "";
  };

  const getPaessRoute = (routeLetter: string) => {
    switch (routeLetter) {
      case "g":
        return "GREEN LINE";
      case "r":
        return "RED LINE";
      case "m":
        return "MATTAPAN";
      case "b":
        return "BLUE LINE";
      case "o":
        return "ORANGE LINE";
      case "s":
        return "BUS";
    }
  };

  const getScreenLocation = () => {
    if (isPaess) {
      return `/ ${getPaessRoute(getPaessRouteLetter())}`;
    } else props.screens[0].location ? `/ ${props.screens[0].location}` : "";
  };

  const generateSource = (screen: Screen) => {
    const { id, type } = screen;
    // @ts-ignore Suppressing "object could be null" warning
    const { environmentName } = document.getElementById("app").dataset;

    let baseUrl;
    if (environmentName === "dev") {
      baseUrl = "https://screens-dev.mbtace.com";
    } else if (environmentName === "dev-green") {
      baseUrl = "https://screens-dev-green.mbtace.com";
    } else {
      baseUrl = "https://screens.mbta.com";
    }

    if (type.includes("v2")) {
      return `${baseUrl}/v2/screen/${id}/simulation`;
    }
    if (
      ["bus_eink", "gl_eink_single", "gl_eink_double", "solari"].includes(type)
    ) {
      return `${baseUrl}/screen/${id}`;
    }
    if (type === "dup") {
      return `${baseUrl}/screen/${id}/simulation`;
    }

    return "";
  };

  return (
    <div
      className={classNames("screen-detail__container", {
        [`screen-detail__container--paess screen-detail__container--paess-${getPaessRouteLetter()}`]:
          isPaess,
      })}
    >
      <div className="screen-detail__header">
        <div
          className={classNames("screen-detail__screen-type-location", {
            "screen-detail__screen-type-location--paess-s":
              isPaess && getPaessRouteLetter() == "s",
            "screen-detail__screen-type-location--paess": isPaess,
          })}
        >
          {translateScreenType()} {getScreenLocation()}
        </div>
        {props.screens[0].type === "dup" && (
          <div className="screen-detail__dup-ad-text">
            Cycle in the ad loop for 7.5 seconds every 45 seconds
          </div>
        )}
        {!isPaess && (
          <div className="screen-detail__report-a-problem-button">
            <ReportAProblemButton />
          </div>
        )}
      </div>
      {props.isOpen &&
        (isPaess ? (
          <PaessDetailContainer
            key={props.screens[0].station_code}
            screens={props.screens}
          ></PaessDetailContainer>
        ) : (
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
          ))
        ))}
    </div>
  );
};

export default ScreenDetail;
