// Note: component name is a bit unclear--this can show detail for both pending and live screens,
// but its presentation is particular to the pending screens page.

import React, { ComponentType, SyntheticEvent } from "react";
import { SORT_LABELS } from "../../constants/constants";
import { ScreenConfiguration } from "../../models/screen_configuration";
import ScreenSimulation from "./ScreenSimulation";
import { Col, Container, Form, Row } from "react-bootstrap";
import { capitalize } from "../../util";
import OpenInTabButton from "./OpenInTabButton";
import CopyLinkButton from "./CopyLinkButton";
import {
  DirectionID,
  useScreenplayDispatchContext,
} from "../../hooks/useScreenplayContext";
import { LightningChargeFill, ClockFill } from "react-bootstrap-icons";

interface Props {
  screenID: string;
  isLive: boolean;
  config: ScreenConfiguration;
  isHiddenOnPlacesPage: boolean;
  onClickHideOnPlacesPage: () => void;
}

const getGLScreenLocationDescription = (
  config: ScreenConfiguration & { app_id: "gl_eink_v2" }
) => {
  let direction = "";
  switch (config.app_params.header.direction_id) {
    case 0:
      direction = "Westbound";
      break;
    case 1:
      direction = "Eastbound";
  }

  const platformLocation = capitalize(
    config.app_params.platform_location ?? ""
  );

  return [direction, platformLocation].join(" ");
};

const getScreenLocationDescription = (config: ScreenConfiguration) => {
  switch (config.app_id) {
    case "gl_eink_v2":
      return getGLScreenLocationDescription(config);
    default:
      console.warn(
        `getScreenLocationDescription not implemented for ${config.app_id}`
      );
      return "";
  }
};

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

  const locationDescription = getScreenLocationDescription(config);

  const fullScreenUrl = isLive
    ? `${screensUrl}/v2/screen/${screenID}`
    : `${screensUrl}/v2/screen/pending/${screenID}`;

  // If screen is already live, this matches `fullScreenUrl`.
  // If screen is pending, this is its future (but not yet working) live url.
  const liveScreenUrl = `${screensUrl}/v2/screen/${screenID}`;

  return (
    <div
      className="pending-screen-detail"
      onClick={(e: SyntheticEvent) => e.stopPropagation()}
    >
      <Container fluid className="h5">
        <Row>
          {locationDescription && (
            <Col className="d-flex justify-content-start location-description">
              {locationDescription}
            </Col>
          )}
          <Col className="d-flex justify-content-end location-description">
            {isLive ? (
              <>
                <div className="live-icon">
                  <LightningChargeFill size={16} color="#eff193" />
                </div>
                <div className="pending-or-live">Live · Read-only</div>
              </>
            ) : (
              <>
                <div className="live-icon">
                  <ClockFill size={16} />
                </div>
                <div className="pending-or-live">Pending</div>
              </>
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            Screen ID:{" "}
            <span className="screen-id body--regular">{screenID}</span>
          </Col>
        </Row>
        <Row>
          <Col lg="auto" className="pe-3">
            <div className="screen-url">Live screen URL:</div>
            {isLive ? (
              <a className="url body--regular" href={liveScreenUrl}>
                {liveScreenUrl}
              </a>
            ) : (
              <span className="url url--inactive">{liveScreenUrl}</span>
            )}
            <div className="screen-url-row-button">
              <OpenInTabButton url={fullScreenUrl} />
            </div>
            <div className="screen-url-row-button">
              <CopyLinkButton
                url={liveScreenUrl}
                queueToastExpiration={queueToastExpiration}
              />
            </div>
            {!isLive && (
              <div className="pending-url-advisory">
                Screen will be available at this URL once published
              </div>
            )}
          </Col>
        </Row>
        {!isLive && (
          <Row>
            <Col lg="auto">
              <Form.Check
                checked={isHiddenOnPlacesPage}
                readOnly
                onClick={onClickHideOnPlacesPage}
                inline
              />
              <div
                className="hide-on-places-page"
                onClick={onClickHideOnPlacesPage}
              >
                Hide on Places page
              </div>
            </Col>
          </Row>
        )}
        <Row className="screen-simulation">
          <ScreenSimulation
            screen={{ id: screenID, type: config.app_id, disabled: false }}
            isPending={!isLive}
          />
        </Row>
      </Container>
    </div>
  );
};

export default PendingScreenDetail;
