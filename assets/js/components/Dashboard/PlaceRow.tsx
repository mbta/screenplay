import React, { useContext } from "react";
import {
  Accordion,
  Col,
  Container,
  Row,
  useAccordionButton,
  AccordionContext,
} from "react-bootstrap";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
import classNames from "classnames";
import { Place } from "../../models/place";
import { Screen } from "../../models/screen";
import ScreenDetail from "./ScreenDetail";
import STATION_ORDER_BY_LINE, { Station } from "../../constants/stationOrder";

interface PlaceRowProps {
  place: Place;
  eventKey: string;
  onClick: (eventKey: string) => void;
  filteredLine?: string | null;
  defaultSort: boolean;
}

/**
 * Component used to display each place and their screen simulations.
 * Assumes it is displayed in an Accordion component from react-bootstrap.
 */
const PlaceRow = (props: PlaceRowProps): JSX.Element => {
  const { routes, name, screens } = props.place;
  const { activeEventKey } = useContext(AccordionContext);
  const rowOnClick = useAccordionButton(props.eventKey, () =>
    props.onClick(props.eventKey)
  );
  const isOpen = activeEventKey?.includes(props.eventKey);
  const hasScreens =
    screens.length > 0 && screens.filter((screen) => !screen.hidden).length > 0;

  const formatScreenTypes = () => {
    if (!hasScreens) {
      return "no screens";
    }

    const typeMap: Record<string, string> = {
      pa_ess: "PA",
      bus_shelter_v2: "Bus Shelter",
      pre_fare_v2: "Prefare",
      dup: "DUP",
      gl_eink_single: "GL E-Ink",
      gl_eink_double: "GL E-Ink",
      gl_eink_v2: "GL E-Ink",
      bus_eink: "Bus E-Ink",
      bus_eink_v2: "Bus E-Ink",
      solari: "Solari",
    };

    const types = new Set(sortScreens().map((screen) => typeMap[screen.type]));
    return Array.from(types).join(" · ");
  };

  const sortScreens = (screenList: Screen[] = screens) => {
    const screenTypeOrder = [
      "dup",
      "bus_shelter_v2",
      "bus_eink",
      "bus_eink_v2",
      "gl_eink_single",
      "gl_eink_double",
      "gl_eink_v2",
      "pre_fare_v2",
      "solari",
      "pa_ess",
    ];

    return screenList.sort((a, b) =>
      screenTypeOrder.indexOf(a.type) >= screenTypeOrder.indexOf(b.type)
        ? 1
        : -1
    );
  };

  const filterAndGroupScreens = (screens: Screen[]) => {
    const visibleScreens = screens.filter((screen) => !screen.hidden);
    const paEssScreens = visibleScreens.filter(
      (screen) => screen.type === "pa_ess"
    );
    const groupedScreens = visibleScreens
      .filter((screen) => screen.type !== "pa_ess")
      .map((screen) => [screen]);

    if (paEssScreens.length > 0) {
      groupedScreens.push(paEssScreens);
    }

    return groupedScreens;
  };

  const renderModesAndLinesIcons = () => {
    const numberOfGLBranches = routes.filter((route) =>
      route.startsWith("Green-")
    ).length;

    // If the list of routes contains a single GL branch, show the GL branch icon.
    // If it contains more than one branch, show the GL icon.
    // Otherwise, show the route icon.
    const newRoutes = routes.reduce((result: string[], current) => {
      if (current.startsWith("Green-") && numberOfGLBranches > 1) {
        if (!result.includes("Green")) {
          result.push("Green");
        }
      } else {
        result.push(current);
      }
      return result;
    }, []);

    return newRoutes.map((route) => (
      <img
        className="place-row__mode-line-icon"
        key={route}
        src={`/images/pills/${route.toLowerCase()}.png`}
        alt={route}
        width={38}
        height={20}
      />
    ));
  };

  const getInlineMap = (place: Place, stationOrder: Station[]) => {
    return stationOrder.find(
      (station) => station.name.toLowerCase() === place.name.toLowerCase()
    )?.inlineMap;
  };

  return (
    <div
      key={props.eventKey}
      onClick={hasScreens ? rowOnClick : () => undefined}
      className={classNames("place-row", {
        open: isOpen,
        disabled: !hasScreens,
        "filtered-by-route": props.filteredLine,
      })}
      data-testid="place-row"
    >
      <Container fluid>
        <Row className="align-items-center text-white">
          <Col lg={4} className="d-flex align-items-center">
            <div
              className={classNames("place-row__toggle", {
                "hidden-toggle": !hasScreens,
              })}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            {props.filteredLine && (
              <div
                className={classNames(
                  "place-row__map-segment-container",
                  `place-row__map-segment-container--${props.filteredLine}`,
                  {
                    "place-row__map-segment-container--flipped":
                      !props.defaultSort,
                  }
                )}
              >
                <img
                  className="place-row__map-segment"
                  src={`/images/inline-maps/${getInlineMap(
                    props.place,
                    STATION_ORDER_BY_LINE[props.filteredLine.toLowerCase()]
                  )}.png`}
                  alt=""
                />
              </div>
            )}
            <div className="place-row__name" data-testid="place-name">
              {name}
            </div>
          </Col>
          <Col lg={3} className="d-flex justify-content-end pe-5">
            {renderModesAndLinesIcons()}
          </Col>
          <Col
            lg={3}
            className="place-row__screen-types pe-5"
            data-testid="place-screen-types"
          >
            {formatScreenTypes()}
          </Col>
          <Col lg={2} className="place-row__status" data-testid="place-status">
            {hasScreens ? "Auto" : "—"}
          </Col>
        </Row>
      </Container>
      <Accordion.Collapse eventKey={props.eventKey}>
        <>
          <div className="place-row__screen-preview-container">
            {hasScreens &&
              filterAndGroupScreens(sortScreens()).map((screens, index) => (
                <ScreenDetail
                  key={index}
                  screens={screens}
                  isOpen={isOpen ?? false}
                />
              ))}
          </div>
        </>
      </Accordion.Collapse>
    </div>
  );
};

export default PlaceRow;
