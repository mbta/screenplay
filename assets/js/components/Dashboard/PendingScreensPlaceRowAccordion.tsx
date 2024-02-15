import React, { ComponentType } from "react";
import { ScreenConfiguration } from "../../models/screen_configuration";
import PendingScreenDetail from "./PendingScreenDetail";
import { Accordion, Button, Col, Container, Row } from "react-bootstrap";
import { Place } from "../../models/place";
import { AccordionToggle } from "./PlaceRow";
import { capitalizeTerminalStops } from "../../util";
import { PencilSquare } from "react-bootstrap-icons";

interface Props {
  place: Place;
  appID: string;
  screens: LiveOrPendingScreen[];
}

interface LiveOrPendingScreen {
  isLive: boolean;
  screenID: string;
  config: ScreenConfiguration;
}

const PendingScreensPlaceRowAccordion: ComponentType<Props> = ({
  place,
  appID,
  screens,
}: Props) => {
  const formatAppID = () => {
    switch (appID) {
      case "gl_eink_v2":
        return "GL E-Ink";

      default:
        return "";
    }
  };

  // TODO: Designs show a "Type" field in accordion header, e.g. "Type: GL E-Ink".
  // This doesn't make sense for Places with multiple screen types, check w/ Mary what to do about it.
  return (
    <div className="pending-screens-place-row-accordion">
      <div className="pending-screens-place-row-accordion__header">
        <Container fluid>
          <Row className="align-items-center text-white">
            <Col
              lg={5}
              className="place-info-col d-flex align-items-center justify-content-start"
            >
              <AccordionToggle eventKey={place.id} hidden={false} />
              <div className="place-name">
                {capitalizeTerminalStops(place.name, null)}
              </div>
              <div className="place-id">Station ID: {place.id}</div>
            </Col>
            <Col className="d-flex justify-content-center">
              Type: {formatAppID()}
            </Col>
            <Col className="buttons d-flex justify-content-end">
              <Button className="edit-button">
                <PencilSquare /> Edit Pending
              </Button>
              <Button className="publish-button">Publish Updates</Button>
            </Col>
          </Row>
        </Container>
      </div>
      <Accordion.Collapse eventKey={place.id}>
        <>
          {screens.map((screen: LiveOrPendingScreen) => (
            <PendingScreenDetail
              {...screen}
              isHiddenOnPlacesPage={false}
              onClickHideOnPlacesPage={() => undefined}
              key={screen.screenID}
            />
          ))}
        </>
      </Accordion.Collapse>
    </div>
  );
};

export default PendingScreensPlaceRowAccordion;
