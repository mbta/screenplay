import React, { ComponentType, useContext, useState } from "react";
import { SCREEN_TYPES } from "../../constants/constants";
import { ScreenConfiguration } from "../../models/screen_configuration";
import PendingScreenDetail from "./PendingScreenDetail";
import {
  Accordion,
  AccordionContext,
  Button,
  Col,
  Container,
  Row,
  useAccordionButton,
} from "react-bootstrap";
import { Place } from "../../models/place";
import { AccordionToggle } from "./PlaceRow";
import { capitalizeTerminalStops } from "../../util";
import { PencilSquare } from "react-bootstrap-icons";
import classNames from "classnames";

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

const formatAppID = (appID: string) => {
  switch (appID) {
    // A few labels are presented differently on this page,
    // to avoid a weird double-":" situation.
    case "gl_eink":
    case "gl_eink_v2":
      return "Green Line E-Ink";

    case "bus_eink":
    case "bus_eink_v2":
      return "Bus E-Ink";

    // All other IDs are formatted as usual.
    default:
      const match = SCREEN_TYPES.find(({ ids }) => ids.includes(appID));
      return match ? match.label : "";
  }
};

const PendingScreensPlaceRowAccordion: ComponentType<Props> = ({
  place,
  appID,
  screens,
}: Props) => {
  const [hiddenFromScreenplayIDs, setHiddenFromScreenplayIDs] = useState<
    string[]
  >([]);
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(place.id);
  const onRowClick = useAccordionButton(place.id);

  const hideCheckboxOnClick = (screenID: string) => {
    if (hiddenFromScreenplayIDs.includes(screenID)) {
      setHiddenFromScreenplayIDs((prevState) =>
        prevState.filter((id) => id !== screenID)
      );
    } else {
      setHiddenFromScreenplayIDs((prevState) => [...prevState, screenID]);
    }
  };

  // TODO: Designs show a "Type" field in accordion header, e.g. "Type: GL E-Ink".
  // This doesn't make sense for Places with multiple screen types, check w/ Mary what to do about it.
  return (
    <div
      className={classNames(
        "pending-screens-place-row-accordion",
        isOpen ? "open" : ""
      )}
      onClick={onRowClick}
    >
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
              Type: {formatAppID(appID)}
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
          {isOpen &&
            screens.map((screen: LiveOrPendingScreen) => (
              <PendingScreenDetail
                {...screen}
                isHiddenOnPlacesPage={hiddenFromScreenplayIDs.includes(
                  screen.screenID
                )}
                onClickHideOnPlacesPage={() =>
                  hideCheckboxOnClick(screen.screenID)
                }
                key={screen.screenID}
              />
            ))}
        </>
      </Accordion.Collapse>
    </div>
  );
};

export default PendingScreensPlaceRowAccordion;
