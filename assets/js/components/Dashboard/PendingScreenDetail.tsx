// Note: component name is a bit unclear--this can show detail for both pending and live screens,
// but its presentation is particular to the pending screens page.

import React, { ComponentType, SyntheticEvent } from "react";
import { ScreenConfiguration } from "../../models/screen_configuration";
import ScreenSimulation from "./ScreenSimulation";
import { Col, Container, Form, Row } from "react-bootstrap";
import { capitalize } from "../../util";
import OpenInTabButton from "./OpenInTabButton";
import CopyLinkButton from "./CopyLinkButton";
import { useScreenplayDispatchContext } from "../../hooks/useScreenplayContext";

interface Props {
  screenID: string;
  isLive: boolean;
  config: ScreenConfiguration;
  // I'm still not super clear what the purpose of this is, or how/where to store it...
  // We now have two different ways of hiding screens from the places list:
  // - When hidden via the old admin tool, the screen is excluded from places_and_screens.json
  // - When hidden this new way, the screen is known to Screenplay--and thus needs a full, valid
  //   config + Screenplay-relevant metadata, since we show info about it here on
  //   the pending page--but ignored when rendering the places list.
  //
  // This seems messy and I'm not sure how to explain the issue to design.
  isHiddenOnPlacesPage: boolean;
  onClickHideOnPlacesPage: () => void;
}

const PendingScreenDetail: ComponentType<Props> = ({
  screenID,
  isLive,
  config,
  isHiddenOnPlacesPage,
  onClickHideOnPlacesPage,
}: Props): JSX.Element => {
  const dispatch = useScreenplayDispatchContext();
  const screensUrl = document
    .querySelector("meta[name=screens-url]")
    ?.getAttribute("content");

  const formatDirectionID = () => {
    switch (config.app_params.header.direction_id) {
      case 0:
        return "Westbound";
      case 1:
        return "Eastbound";
      default:
        return "";
    }
  };

  const queueToastExpiration = () => {
    setTimeout(
      () =>
        dispatch({
          type: "SHOW_LINK_COPIED",
          showLinkCopied: false,
        }),
      5000
    );
  };

  const simulationUrl = isLive
    ? `${screensUrl}/v2/screen/${screenID}/simulation`
    : `${screensUrl}/v2/screen/pending/${screenID}/simulation`;

  return (
    <div
      className="pending-screen-detail"
      onClick={(e: SyntheticEvent) => e.stopPropagation()}
    >
      <Container className="h5">
        <Row>
          <Col className="d-flex justify-content-start">
            {formatDirectionID()}{" "}
            {capitalize(config.app_params.platform_location ?? "")}
          </Col>
          <Col className="d-flex justify-content-end">
            {isLive ? "Live · Read-only" : "Pending"}
          </Col>
        </Row>
        <Row>
          <Col>
            Screen ID: <span className="body--regular">{screenID}</span>
          </Col>
        </Row>
        <Row className="screen-url">
          <Col lg="auto" className="pe-3">
            Screen URL:
          </Col>
          <Col lg="auto" className="p-0 pe-3">
            <a className="url body--regular" href={simulationUrl}>
              https://.../{screenID}
            </a>
          </Col>
          <Col lg="1" className="p-0">
            <OpenInTabButton url={simulationUrl} />
          </Col>
          <Col lg="auto" className="p-0">
            <CopyLinkButton
              url={simulationUrl}
              queueToastExpiration={queueToastExpiration}
            />
          </Col>
        </Row>
        {!isLive && (
          <Row>
            <Col lg="auto">
              <Form.Check
                checked={isHiddenOnPlacesPage}
                readOnly
                onClick={onClickHideOnPlacesPage}
              />
            </Col>
            <Col>Hide on Live Screens</Col>
          </Row>
        )}
        <Row className="screen-simulation">
          <ScreenSimulation
            screen={{ id: screenID, type: config.app_id, disabled: false }}
          />
        </Row>
      </Container>
    </div>
  );
};

export default PendingScreenDetail;
