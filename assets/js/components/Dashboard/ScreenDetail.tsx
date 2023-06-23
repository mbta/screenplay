import React, { SyntheticEvent } from "react";
import { Screen } from "../../models/screen";
import ScreenDetailHeader from "./ScreenDetailHeader";
import { SCREEN_TYPES } from "../../constants/constants";
import PaessDetailContainer from "./PaessDetailContainer";
import classNames from "classnames";

interface ScreenDetailProps {
  screens: Screen[];
  isOpen: boolean;
  isMultipleScreens?: boolean;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const isSolari = props.screens.every((screen) => screen.type === "solari");
  const isMultipleScreens = props.screens.length > 1;

  return isSolari ? (
    <div className="screen-detail__solari-layout">
      {props.screens.map((screens, index) => (
        <ScreenCard
          {...props}
          key={index}
          screens={[screens]}
          isMultipleScreens={isMultipleScreens}
        />
      ))}
    </div>
  ) : (
    <ScreenCard {...props} />
  );
};

const ScreenCard = (props: ScreenDetailProps) => {
  const { screens, isOpen, isMultipleScreens } = props;
  const isPaess = screens.every((screen) => screen.type === "pa_ess");
  const isSolari = screens.every((screen) => screen.type === "solari");
  const paessRouteLetter = screens[0].station_code
    ? screens[0].station_code.charAt(0).toLowerCase()
    : "";

  const translatedScreenType = SCREEN_TYPES.find(({ ids }) =>
    ids.includes(screens[0].type)
  )?.label;

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

  const getScreenLocation = isPaess
    ? `/ ${getPaessRoute(paessRouteLetter)}`
    : screens[0].location
    ? `/ ${screens[0].location}`
    : "";

  const generateSource = (screen: Screen) => {
    const { id, type } = screen;
    // @ts-ignore Suppressing "object could be null" warning
    const screensUrl = document
      .querySelector("meta[name=screens-url]")
      ?.getAttribute("content");
    const queryParams = "requestor=screenplay";

    if (type.includes("v2")) {
      return `${screensUrl}/v2/screen/${id}/simulation?${queryParams}`;
    }
    if (
      ["bus_eink", "gl_eink_single", "gl_eink_double", "solari"].includes(type)
    ) {
      return `${screensUrl}/screen/${id}?${queryParams}`;
    }
    if (type === "dup") {
      return `${screensUrl}/screen/${id}/simulation?${queryParams}`;
    }

    return "";
  };

  return (
    <div
      className={classNames("screen-detail__container", {
        [`screen-detail__container--paess screen-detail__container--paess-${paessRouteLetter}`]:
          isPaess,
        [`screen-detail__container--solari`]: isSolari,
      })}
      onClick={(e: SyntheticEvent) => e.stopPropagation()}
    >
      {isOpen &&
        (isPaess ? (
          <div>
            <div className="screen-detail__header">
              <div
                className={classNames(
                  "screen-detail__screen-type-location screen-detail__screen-type-location--paess",
                  {
                    "screen-detail__screen-type-location--paess-s":
                      paessRouteLetter == "s",
                  }
                )}
              >
                {translatedScreenType} {getScreenLocation}
              </div>
            </div>
            <PaessDetailContainer
              key={screens[0].station_code}
              screens={screens}
            ></PaessDetailContainer>
          </div>
        ) : (
          screens.map((screen) => (
            <div key={screen.id}>
              <ScreenDetailHeader
                screen={screen}
                isMultipleScreens={isMultipleScreens}
                translatedScreenType={translatedScreenType}
                screenLocation={getScreenLocation}
              />
              <div
                className={`screen-detail__iframe-container screen-detail__iframe-container--${screen.type}`}
              >
                <iframe
                  className={`screen-detail__iframe screen-detail__iframe--${screen.type}`}
                  title={screen.id}
                  src={generateSource(screen)}
                />
              </div>
            </div>
          ))
        ))}
    </div>
  );
};

export default ScreenDetail;
