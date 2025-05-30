import * as React from "react";
import PaessScreenDetail from "Components/PaessScreenDetail";
import { Screen } from "Models/screen";
import { Row, Col } from "react-bootstrap";

interface PaessDetailContainerProps {
  screens: Screen[];
}

const PaessDetailContainer = (
  props: PaessDetailContainerProps,
): JSX.Element => {
  const zonePositions = {
    left: ["s", "w"],
    center: ["c", "m"],
    right: ["n", "e"],
  };

  const stationCode = props.screens[0].station_code;
  const leftScreens = props.screens.filter(
    (screen) =>
      screen.zone !== undefined && zonePositions.left.includes(screen.zone),
  );
  const centerScreens = props.screens.filter(
    (screen) =>
      screen.zone !== undefined && zonePositions.center.includes(screen.zone),
  );
  const rightScreens = props.screens.filter(
    (screen) =>
      screen.zone !== undefined && zonePositions.right.includes(screen.zone),
  );

  return (
    <Row className="h-100" lg={3}>
      <Col
        key={`${stationCode}-left`}
        className={`screen-simulation__iframe-container screen-simulation__iframe-container--pa_ess`}
        data-testid="paess-col-left"
      >
        {leftScreens.length > 0 && (
          <div>
            {leftScreens.map(
              (screen) =>
                screen.station_code !== undefined &&
                screen.zone !== undefined && (
                  <PaessScreenDetail
                    key={`${screen.station_code}-${screen.zone}`}
                    stationCode={screen.station_code}
                    zone={screen.zone}
                    label={screen.label}
                  />
                ),
            )}
          </div>
        )}
      </Col>
      <Col
        key={`${stationCode}-center`}
        className={`screen-simulation__iframe-container screen-simulation__iframe-container--pa_ess`}
        data-testid="paess-col-center"
      >
        {centerScreens.length > 0 && (
          <div>
            {centerScreens.map(
              (screen) =>
                screen.station_code !== undefined &&
                screen.zone !== undefined && (
                  <PaessScreenDetail
                    key={`${screen.station_code}-${screen.zone}`}
                    stationCode={screen.station_code}
                    zone={screen.zone}
                    label={screen.label}
                  />
                ),
            )}
          </div>
        )}
      </Col>
      <Col
        key={`${stationCode}-right`}
        className={`screen-simulation__iframe-container screen-simulation__iframe-container--pa_ess`}
        data-testid="paess-col-right"
      >
        {rightScreens.length > 0 && (
          <div>
            {rightScreens.map(
              (screen) =>
                screen.station_code !== undefined &&
                screen.zone !== undefined && (
                  <PaessScreenDetail
                    key={`${screen.station_code}-${screen.zone}`}
                    stationCode={screen.station_code}
                    zone={screen.zone}
                    label={screen.label}
                  />
                ),
            )}
          </div>
        )}
      </Col>
    </Row>
  );
};

export default PaessDetailContainer;
