import * as React from "react";
import PaessScreenDetail from "./PaessScreenDetail";
import { Screen } from "../../models/screen";
import { Row, Col } from "react-bootstrap";

interface PaessDetailContainerProps {
  screens: Screen[];
}

const PaessDetailContainer = (
  props: PaessDetailContainerProps
): JSX.Element => {
  const zonePositions = {
    left: ["s", "w"],
    center: ["c", "m"],
    right: ["n", "e"],
  };

  const stationCode = props.screens[0].station_code!;
  const leftScreens = props.screens.filter((screen) =>
    zonePositions.left.includes(screen.zone!)
  );
  const centerScreens = props.screens.filter((screen) =>
    zonePositions.center.includes(screen.zone!)
  );
  const rightScreens = props.screens.filter((screen) =>
    zonePositions.right.includes(screen.zone!)
  );

  return (
    <Row className="h-100" md={3}>
      {leftScreens.length > 0 && (
        <Col
          key={`${stationCode}-left`}
          className={`screen-detail__iframe-container screen-detail__iframe-container--pa_ess`}
          data-testid="paess-col-left"
        >
          <div>
            {leftScreens.map((screen) => (
              <PaessScreenDetail
                key={`${screen.station_code!}-${screen.zone!}`}
                stationCode={screen.station_code!}
                zone={screen.zone!}
                label={screen.label}
              />
            ))}
          </div>
        </Col>
      )}
      {centerScreens.length > 0 && (
        <Col
          key={`${stationCode}-center`}
          className={`screen-detail__iframe-container screen-detail__iframe-container--pa_ess`}
          data-testid="paess-col-center"
        >
          <div>
            {centerScreens.map((screen) => (
              <PaessScreenDetail
                key={`${screen.station_code!}-${screen.zone!}`}
                stationCode={screen.station_code!}
                zone={screen.zone!}
                label={screen.label}
              />
            ))}
          </div>
        </Col>
      )}
      {rightScreens.length > 0 && (
        <Col
          key={`${stationCode}-right`}
          className={`screen-detail__iframe-container screen-detail__iframe-container--pa_ess`}
          data-testid="paess-col-right"
        >
          <div>
            {rightScreens.map((screen) => (
              <PaessScreenDetail
                key={`${screen.station_code!}-${screen.zone!}`}
                stationCode={screen.station_code!}
                zone={screen.zone!}
                label={screen.label}
              />
            ))}
          </div>
        </Col>
      )}
    </Row>
  );
};

export default PaessDetailContainer;
