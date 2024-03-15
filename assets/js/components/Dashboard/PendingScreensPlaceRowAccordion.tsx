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
import { useNavigate } from "react-router-dom";

interface Props {
  place: Place;
  appID: string;
  placeID: string;
  screens: LiveOrPendingScreen[];
  buttonsDisabled: boolean;
  publishCallback: (
    placeID: string,
    appID: string,
    hiddenFromScreenplayIDs: string[]
  ) => void;
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
      return SCREEN_TYPES.find(({ ids }) => ids.includes(appID))?.label ?? "";
  }
};

// When included in the /configure-screens/* route, app IDs are changed as follows:
// 1. Remove `_v2` suffix
// 2. Convert from snake_case to kebab-case
const appIDAsRoutePart = (appID: string) =>
  appID.replace("_v2", "").replace("_", "-");

const PendingScreensPlaceRowAccordion: ComponentType<Props> = ({
  place,
  appID,
  placeID,
  screens,
  buttonsDisabled,
  publishCallback,
}: Props) => {
  const [hiddenFromScreenplayIDs, setHiddenFromScreenplayIDs] = useState<
    string[]
  >([]);
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(place.id);
  const onRowClick = useAccordionButton(place.id);
  const navigate = useNavigate();

  const handleClickHideCheckbox = (screenID: string) => {
    if (hiddenFromScreenplayIDs.includes(screenID)) {
      setHiddenFromScreenplayIDs((prevState) =>
        prevState.filter((id) => id !== screenID)
      );
    } else {
      setHiddenFromScreenplayIDs((prevState) => [...prevState, screenID]);
    }
  };

  const handleClickEdit = () => {
    navigate(`/configure-screens/${appIDAsRoutePart(appID)}`, {
      state: { place_id: placeID },
    });
  };

  const handleClickPublish = () => {
    publishCallback(placeID, appID, hiddenFromScreenplayIDs);
  };

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
              <Button
                className="edit-button"
                onClick={handleClickEdit}
                disabled={buttonsDisabled}
              >
                <PencilSquare /> Edit Pending
              </Button>
              <Button
                className="publish-button"
                onClick={handleClickPublish}
                disabled={buttonsDisabled}
              >
                Publish Updates
              </Button>
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
                  handleClickHideCheckbox(screen.screenID)
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
