import React, { ReactElement, useContext } from "react";
import {
  Col,
  Container,
  Row,
  AccordionContext,
  Fade,
  Form,
} from "react-bootstrap";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
import classNames from "classnames";
import { Place } from "Models/place";
import MapSegment from "Components/MapSegment";
import STATION_ORDER_BY_LINE from "Constants/stationOrder";
import {
  capitalizeTerminalStops,
  classWithModifier,
  sortScreens,
} from "../../util";

const typeMap: Record<string, string> = {
  pa_ess: "PA",
  bus_shelter_v2: "Bus Shelter",
  pre_fare_v2: "Prefare",
  dup_v2: "DUP",
  gl_eink_v2: "GL E-Ink",
  bus_eink_v2: "Bus E-Ink",
  busway_v2: "Sectional",
  elevator_v2: "Elevator",
};

const inlineMap = (place: Place, line: string) => {
  const station = STATION_ORDER_BY_LINE[line].find(
    (station) => station.name.toLowerCase() === place.name.toLowerCase(),
  );

  if (!station) return;

  return <MapSegment station={station} line={line} className="map-segment" />;
};

interface AccordionToggleProps {
  eventKey: string;
  hidden?: boolean;
}

const AccordionToggle = ({
  eventKey,
  hidden,
}: AccordionToggleProps): JSX.Element => {
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(eventKey) || false;
  const Chevron = isOpen ? ChevronDown : ChevronRight;

  return (
    <div
      className={classNames("place-row__toggle", {
        "hidden-toggle": hidden,
      })}
    >
      <Chevron size={16} className="bootstrap-line-icon" />
    </div>
  );
};

interface SelectBoxToggleProps {
  checked?: boolean;
  disabled?: boolean;
}

const SelectBoxToggle = ({
  checked,
  disabled,
}: SelectBoxToggleProps): JSX.Element => {
  return (
    <div className="place-row__toggle">
      <Form.Check disabled={disabled} checked={checked} readOnly />
    </div>
  );
};

type AccordionProps = {
  onClick: React.EventHandler<React.SyntheticEvent>;
  variant: "accordion";
};

type SelectBoxProps = {
  onClick: (arg?: boolean) => void;
  variant: "select-box";
};

type PlaceRowProps = {
  place: Place;
  eventKey?: string;
  className?: string;
  filteredLine?: string | null;
  defaultSort?: boolean;
  showAnimation?: boolean;
  disabled?: boolean;
  children?: ReactElement;
  checked?: boolean;
} & (AccordionProps | SelectBoxProps);

/**
 * Component used to display summary info about a place and its screens.
 */
const PlaceRow = ({
  place,
  eventKey,
  onClick,
  className,
  filteredLine,
  defaultSort,
  showAnimation,
  disabled,
  children,
  variant,
  checked,
}: PlaceRowProps): JSX.Element => {
  const { routes, name, description, screens: allScreens } = place;

  const screens = sortScreens(allScreens).filter((screen) => !screen.hidden);
  const hasScreens = screens.length > 0;

  const screenTypes = hasScreens
    ? Array.from(new Set(screens.map((screen) => typeMap[screen.type])))
    : ["no screens"];

  const modesAndLinesIcons = () => {
    const numberOfGLBranches = routes.filter((route) =>
      route.startsWith("Green-"),
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
        className={classWithModifier(
          "place-row__mode-line-icon",
          route.toLowerCase(),
        )}
        key={route}
        src={`/images/pills/${route.toLowerCase()}.svg`}
        alt={route}
      />
    ));
  };

  // Function to add optional description and capitalize terminal stops
  // according to STATION_ORDER_BY_LINE
  const formatStationName = (stationName: string, description?: string) => {
    if (description) {
      stationName = `${stationName} ${description}`;
    }

    return capitalizeTerminalStops(stationName, filteredLine);
  };

  const formatScreenTypes = () =>
    screenTypes.map((type, index) =>
      index < screenTypes.length - 1 ? `${type}  ·  ` : type,
    );

  const onRowClick =
    variant === "select-box" ? () => onClick(!checked) : onClick;

  return (
    <div
      className={classNames("place-row", className, {
        disabled: disabled,
      })}
      data-testid="place-row"
    >
      <Fade appear in={showAnimation}>
        <div className="update-animation"></div>
      </Fade>
      <div onClick={onRowClick}>
        <Container fluid>
          <Row
            className="align-items-center text-white"
            data-testid="place-row-header"
          >
            <Col lg={5} className="d-flex align-items-center">
              {variant === "accordion" && eventKey ? (
                <AccordionToggle eventKey={eventKey} hidden={!hasScreens} />
              ) : (
                <SelectBoxToggle checked={checked} disabled={disabled} />
              )}
              {filteredLine && (
                <div
                  className={classNames(
                    "place-row__map-segment-container",
                    `place-row__map-segment-container--${filteredLine}`,
                    {
                      "place-row__map-segment-container--flipped": !defaultSort,
                    },
                  )}
                >
                  {inlineMap(place, filteredLine.toLowerCase())}
                </div>
              )}
              <div className="place-row__name" data-testid="place-name">
                {formatStationName(name, description)}
              </div>
            </Col>
            <Col lg={1} className="d-flex justify-content-end">
              {modesAndLinesIcons()}
            </Col>
            <Col
              lg={3}
              className="place-row__screen-types"
              data-testid="place-screen-types"
            >
              {formatScreenTypes()}
            </Col>
            <Col
              lg={3}
              className="place-row__status"
              data-testid="place-status"
            >
              {hasScreens ? "Auto" : "—"}
            </Col>
          </Row>
        </Container>
        {/*
        Needed to allow Accordion functionality to work. With this way of rendering Accordion.Collapse,
        this component can leave out all references to Accordion while maintaining original functionality.
        */}
        {variant === "accordion" && children}
      </div>
    </div>
  );
};

export { AccordionToggle };
export default PlaceRow;
