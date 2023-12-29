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
import classNames from "classnames";
import {
  ArrowLeft,
  ArrowRight,
  Dot,
  LightningChargeFill,
  Plus,
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
        <div className="h3 text-white mb-5">Configure Green Line Stations</div>
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
      <Row className="screens-table-container">
        <Table borderless className="screens-table m-0">
          <thead className="screens-table-header">
            <tr className="body--regular">
              <th className="screen-id">Screen ID</th>
              <th className="direction">Direction</th>
              <th className="platform-location">Platform Location</th>
              <th className="status"></th>
            </tr>
          </thead>
          <tbody className="screens-table-body">
            {existingLiveScreens.map((screen) => (
              <ConfigureScreenRow
                key={screen.id}
                config={screen}
                isLive
                onChange={() => undefined}
              />
            ))}
            {pendingScreens.map((screen, index) => (
              <ConfigureScreenRow
                key={`pendingScreens.${screen.id}`}
                config={screen}
                onChange={(screen: ScreenConfiguration) => {
                  setPendingScreens((prevState) => {
                    const newState = [...prevState];
                    newState[index] = screen;
                    return newState;
                  });
                }}
              />
            ))}
            {newScreens.map((screen, index) => (
              <ConfigureScreenRow
                key={`newScreens.${index}`}
                config={screen}
                onChange={(screen: ScreenConfiguration) => {
                  setNewScreens((prevState) => {
                    const newState = [...prevState];
                    newState[index] = screen;
                    return newState;
                  });
                }}
              />
            ))}
            <tr className="add-screen-button-row">
              <td>
                <div
                  className="add-screen-button"
                  onClick={() => {
                    setNewScreens((prev) => [
                      ...prev,
                      {
                        id: "",
                        app_params: { header: { route_id: place.routes[0] } },
                      },
                    ]);
                  }}
                >
                  <Plus fill="#F8F9FA" /> Add Screen
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

interface ConfigureScreenRowProps {
  config: ScreenConfiguration;
  isLive?: boolean;
  onChange: (screen: ScreenConfiguration) => void;
}
const ConfigureScreenRow: ComponentType<ConfigureScreenRowProps> = ({
  config,
  isLive,
  onChange,
}: ConfigureScreenRowProps) => {
  const direction = config.app_params?.header.direction_id;
  const platformDirection = config.app_params ? "front" : "back";

  return (
    <tr className="screen-row">
      <td className="screen-id">
        <Form.Control
          className="screen-id-input"
          disabled={isLive}
          value={config.id}
          onChange={(e) => {
            onChange({ ...config, id: e.target.value });
          }}
          placeholder="EIG-"
        />
      </td>
      <td className="direction">
        <ButtonGroup className="row-button-group">
          <Button
            className={classNames("row-button", {
              selected: direction === 0,
            })}
            onClick={() => {
              config.app_params.header.direction_id = 0;
              onChange(config);
            }}
            disabled={isLive}
          >
            <ArrowLeft /> Westbound
          </Button>
          <Button
            className={classNames("row-button", {
              selected: direction === 1,
            })}
            onClick={() => {
              config.app_params.header.direction_id = 1;
              onChange(config);
            }}
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
            onClick={() => onChange(config)}
            disabled={isLive}
          >
            Front
          </Button>
          <Button
            className={classNames("row-button", {
              selected: platformDirection === "back",
            })}
            onClick={() => onChange(config)}
            disabled={isLive}
          >
            Back
          </Button>
        </ButtonGroup>
      </td>
      <td className="status">
        {isLive ? (
          <div>
            <LightningChargeFill fill="#EFF193" /> Live · Read-only
          </div>
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
