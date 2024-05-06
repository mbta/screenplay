import React, { SyntheticEvent, useContext } from "react";
import { Screen } from "../../models/screen";
import ScreenDetailHeader from "./ScreenDetailHeader";
import ScreenSimulation from "./ScreenSimulation";
import { SCREEN_TYPES } from "../../constants/constants";
import PaessDetailContainer from "./PaessDetailContainer";
import classNames from "classnames";
import { AccordionContext } from "react-bootstrap";

interface ScreenDetailProps {
  screens: Screen[];
  eventKey: string;
  isInlineGroup?: boolean;
  isMultipleScreens?: boolean;
}

const ScreenDetail = (props: ScreenDetailProps): JSX.Element => {
  const isMultipleScreens = props.screens.length > 1;

  return props.isInlineGroup ? (
    <div className="screen-detail__inline-layout">
      {props.screens.map((screen, index) => (
        <ScreenCard
          {...props}
          key={index}
          screens={[screen]}
          isMultipleScreens={isMultipleScreens}
        />
      ))}
    </div>
  ) : (
    <ScreenCard {...props} />
  );
};

const ScreenCard = (props: ScreenDetailProps) => {
  const { screens, eventKey, isMultipleScreens } = props;
  const isPaess = screens.every((screen) => screen.type === "pa_ess");
  const isTriptych = screens.every((screen) => screen.type === "triptych_v2");
  const paessRouteLetter = screens[0].station_code
    ? screens[0].station_code.charAt(0).toLowerCase()
    : "";

  const translatedScreenType = SCREEN_TYPES.find(({ ids }) =>
    ids.includes(screens[0].type),
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

  const getTriptychPlatform = (routeId: string, directionId: number) => {
    if (["Orange", "Red"].includes(routeId)) {
      return directionId === 0 ? "Southbound" : "Northbound";
    } else {
      return directionId === 0 ? "Westbound" : "Eastbound";
    }
  };

  const getScreenLocation = () => {
    if (isPaess) {
      return `/ ${getPaessRoute(paessRouteLetter)}`;
    } else if (isTriptych) {
      const [_prefix, _stationName, routeId, directionId, _index] =
        screens[0].id.split("-");

      return `/ ${getTriptychPlatform(routeId, parseInt(directionId))}`;
    } else if (screens[0].location) {
      return `/ ${screens[0].location}`;
    } else {
      return "";
    }
  };

  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(eventKey);

  return (
    <div
      className={classNames("screen-detail__container", {
        [`screen-detail__container--paess screen-detail__container--paess-${paessRouteLetter}`]:
          isPaess,
        [`screen-detail__container--inline`]: props.isInlineGroup,
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
                  },
                )}
              >
                {translatedScreenType} {getScreenLocation()}
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
                screenLocation={getScreenLocation()}
              />
              <ScreenSimulation screen={screen} />
            </div>
          ))
        ))}
    </div>
  );
};

export default ScreenDetail;
