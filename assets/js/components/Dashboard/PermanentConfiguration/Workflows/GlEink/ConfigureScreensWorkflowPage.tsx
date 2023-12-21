import React, { ComponentType, useEffect, useState } from "react";
import { Place } from "../../../../../models/place";
import { fetchExistingScreens } from "../../../../../utils/api";
import { ScreenConfiguration } from "../../../../../models/screen_configuration";
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { DirectionID } from "../../../../../models/direction_id";
import classNames from "classnames";
import {
  ArrowLeft,
  ArrowRight,
  Dot,
  LightningChargeFill,
} from "react-bootstrap-icons";

interface ExistingScreens {
  [place_id: string]: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  };
}

interface ConfigureScreensWorkflowPageProps {
  selectedPlaces: Place[];
}

const ConfigureScreensWorkflowPage: ComponentType<ConfigureScreensWorkflowPageProps> =
  ({ selectedPlaces }: ConfigureScreensWorkflowPageProps) => {
    const [selectedPlacesAndScreens, setSelectedPlacesAndScreens] =
      useState<ExistingScreens>({});

    useEffect(() => {
      if (!selectedPlaces.length) return;
      fetchExistingScreens(
        "gl_eink_v2",
        selectedPlaces.map((place) => place.id),
        (placesAndScreens) => {
          setSelectedPlacesAndScreens(placesAndScreens);
        }
      );
    }, [selectedPlaces]);

    return (
      <Container className="workflow-container">
        <div className="h3 text-white mb-5">Select Green Line Stations</div>
        {selectedPlaces.map((place) => {
          const existingScreens = selectedPlacesAndScreens[place.id];
          return (
            <ConfigurePlaceCard
              key={place.id}
              place={place}
              existingScreens={existingScreens}
            />
          );
        })}
      </Container>
    );
  };

interface ConfigurePlaceCardProps {
  place: Place;
  existingScreens: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  } | null;
}

const ConfigurePlaceCard: ComponentType<ConfigurePlaceCardProps> = ({
  place,
  existingScreens,
}: ConfigurePlaceCardProps) => {
  const existingLiveScreens = existingScreens?.live_screens ?? [];
  const [pendingScreens, setPendingScreens] = useState<ScreenConfiguration[]>(
    existingScreens?.pending_screens ?? []
  );
  const [newScreens, setNewScreens] = useState<ScreenConfiguration[]>([]);
  return (
    <Container className="configure-place-card p-0">
      <Row className="header">
        <Col className="h5 my-auto header-name">{place.name.toUpperCase()}</Col>
        <Col className="body--medium my-auto">Station ID: {place.id}</Col>
      </Row>
      <Row className="table-row">
        <Table borderless className="table">
          <thead>
            <tr className="body--regular">
              <th className="screen-id">Screen ID</th>
              <th className="direction">Direction</th>
              <th className="platform-location">Platform Location</th>
              <th className=""></th>
            </tr>
          </thead>
          <tbody>
            {existingLiveScreens.map((screen) => (
              <ConfigureScreenRow key={screen.id} config={screen} isLive />
            ))}
            {pendingScreens.map((screen) => (
              <ConfigureScreenRow key={screen.id} config={screen} />
            ))}
            {newScreens.map((screen) => (
              <ConfigureScreenRow key={screen.id} config={screen} />
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

interface ConfigureScreenRowProps {
  config: ScreenConfiguration;
  isLive?: boolean;
}
const ConfigureScreenRow: ComponentType<ConfigureScreenRowProps> = ({
  config,
  isLive,
}: ConfigureScreenRowProps) => {
  const [screenId, setScreenId] = useState<string>(config.id);
  const [direction, setDirection] = useState<DirectionID>(
    config.app_params.header.direction_id
  );
  const [platformDirection, setPlatformDirection] = useState<string>("front");

  return (
    <tr>
      <td className="screen-id">
        <Form.Control
          className="screen-id-input"
          value={screenId}
          disabled={isLive}
        />
      </td>
      <td className="direction">
        <ButtonGroup className="row-button-group">
          <Button
            className={classNames("row-button", { selected: direction === 0 })}
            onClick={() => setDirection(0)}
            disabled={isLive}
          >
            <ArrowLeft /> Westbound
          </Button>
          <Button
            className={classNames("row-button", { selected: direction === 1 })}
            onClick={() => setDirection(1)}
            disabled={isLive}
          >
            Eastbound <ArrowRight />
          </Button>
        </ButtonGroup>
      </td>
      <td className="platform-location">
        <ButtonGroup className="row-button-group">
          <Button
            className={classNames("row-button", {
              selected: platformDirection === "front",
            })}
            onClick={() => setPlatformDirection("front")}
            disabled={isLive}
          >
            Front
          </Button>
          <Button
            className={classNames("row-button", {
              selected: platformDirection === "back",
            })}
            onClick={() => setPlatformDirection("back")}
            disabled={isLive}
          >
            Back
          </Button>
        </ButtonGroup>
      </td>
      <td>
        {isLive ? (
          <span>
            <LightningChargeFill fill="#EFF193" /> Live
          </span>
        ) : (
          <span>
            <Dot fill="#8ECDFF" /> Just added
          </span>
        )}
      </td>
    </tr>
  );
};

export { ExistingScreens };

export default ConfigureScreensWorkflowPage;
