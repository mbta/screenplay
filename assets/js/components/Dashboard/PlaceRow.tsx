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
import { Place } from "../../models/place";
import { Screen } from "../../models/screen";
import MapSegment from "./MapSegment";
import STATION_ORDER_BY_LINE from "../../constants/stationOrder";
import { classWithModifier } from "../../util";

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
      <Form.Check
        disabled={disabled}
        checked={checked}
        onChange={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};

interface PlaceRowProps {
  place: Place;
  eventKey?: string;
  onClick: (checked?: boolean) => void;
  className?: string;
  filteredLine?: string | null;
  defaultSort?: boolean;
  showAnimation?: boolean;
  disabled?: boolean;
  children?: ReactElement;
  variant: "accordion" | "select-box";
  checked?: boolean;
}

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
  const { routes, name, description, screens } = place;
  const hasScreens =
    screens.length > 0 && screens.filter((screen) => !screen.hidden).length > 0;

  const typeMap: Record<string, string> = {
    pa_ess: "PA",
    bus_shelter_v2: "Bus Shelter",
    pre_fare_v2: "Prefare",
    dup: "DUP",
    dup_v2: "DUP",
    gl_eink_single: "GL E-Ink",
    gl_eink_double: "GL E-Ink",
    gl_eink_v2: "GL E-Ink",
    bus_eink: "Bus E-Ink",
    bus_eink_v2: "Bus E-Ink",
    solari: "Solari",
    triptych_v2: "Triptych",
  };

  const sortScreens = (screenList: Screen[] = screens) => {
    const screenTypeOrder = [
      "dup",
      "dup_v2",
      "bus_shelter_v2",
      "bus_eink",
      "bus_eink_v2",
      "gl_eink_single",
      "gl_eink_double",
      "gl_eink_v2",
      "pre_fare_v2",
      "triptych_v2",
      "solari",
      "pa_ess",
    ];

    return screenList.sort((a, b) =>
      screenTypeOrder.indexOf(a.type) >= screenTypeOrder.indexOf(b.type)
        ? 1
        : -1
    );
  };

  const screenTypes = !hasScreens
    ? ["no screens"]
    : Array.from(new Set(sortScreens().map((screen) => typeMap[screen.type])));

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
        className={classWithModifier(
          "place-row__mode-line-icon",
          route.toLowerCase()
        )}
        key={route}
        src={`/images/pills/${route.toLowerCase()}.svg`}
        alt={route}
      />
    ));
  };

  const getInlineMap = (place: Place, line: string) => {
    const station = STATION_ORDER_BY_LINE[line].find(
      (station) => station.name.toLowerCase() === place.name.toLowerCase()
    );

    if (!station) return;

    return <MapSegment station={station} line={line} />;
  };

  const capitalizeTerminalStops = (stationName: string) => {
    let isTerminalStop = false;

    // If a filter is present, only look at stations for that filter.
    // This will prevent multi-route stops from being capitalized unless they are a terminal stop of the current filtered line.
    if (filteredLine) {
      const line = STATION_ORDER_BY_LINE[filteredLine.toLowerCase()];
      const terminalStops = line.filter((line) => line.isTerminalStop);
      isTerminalStop = terminalStops.some((stop) => stationName === stop.name);
    }
    // If there is no filtered line, look through all lines to find terminal stops.
    // If a station is a terminal stop for any line, it will be capitalized.
    else {
      isTerminalStop = Object.keys(STATION_ORDER_BY_LINE)
        .filter((key) => !["silver", "mattapan"].includes(key))
        .some((key) => {
          const line = STATION_ORDER_BY_LINE[key];
          const terminalStops = line.filter((line) => line.isTerminalStop);
          return terminalStops.some((stop) => stationName === stop.name);
        });
    }

    return isTerminalStop ? stationName.toUpperCase() : stationName;
  };

  // Function to add optional description and capitalize terminal stops according to STATION_ORDER_BY_LINE
  const formatStationName = (stationName: string, description?: string) => {
    if (description) {
      stationName = `${stationName} ${description}`;
    }

    return capitalizeTerminalStops(stationName);
  };

  const formatScreenTypes = () =>
    screenTypes.map((type, index) =>
      index < screenTypes.length - 1 ? `${type}  ·  ` : type
    );

  const onRowClick = () =>
    variant === "select-box" ? onClick(!checked) : onClick();

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
                    }
                  )}
                >
                  {getInlineMap(place, filteredLine.toLowerCase())}
                </div>
              )}
              <div className="place-row__name" data-testid="place-name">
                {formatStationName(name, description)}
              </div>
            </Col>
            <Col lg={1} className="d-flex justify-content-end">
              {renderModesAndLinesIcons()}
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

export default PlaceRow;
