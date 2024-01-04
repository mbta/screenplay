/* eslint-disable react/no-unescaped-entities */
import React, { ComponentType, ForwardedRef, useEffect, useState } from "react";
import { Place } from "../../../../../models/place";
import { fetchExistingScreens } from "../../../../../utils/api";
import { ScreenConfiguration } from "../../../../../models/screen_configuration";
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
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
  ThreeDotsVertical,
  TrashFill,
} from "react-bootstrap-icons";

interface ExistingScreens {
  [place_id: string]: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  };
}

interface ConfigureScreensWorkflowPageProps {
  selectedPlaces: Place[];
  handleRemoveLocation: (place: string) => void;
}

const ConfigureScreensWorkflowPage: ComponentType<ConfigureScreensWorkflowPageProps> =
  ({
    selectedPlaces,
    handleRemoveLocation,
  }: ConfigureScreensWorkflowPageProps) => {
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

    let layout;
    if (selectedPlaces.length) {
      layout = selectedPlaces.map((place) => {
        const existingScreens = selectedPlacesAndScreens[place.id];
        return (
          <ConfigurePlaceCard
            key={place.id}
            place={place}
            existingScreens={existingScreens}
            handleRemoveLocation={() => handleRemoveLocation(place.id)}
          />
        );
      });
    } else {
      layout = (
        <div>
          All locations have been removed. Select "Back" to select new
          locations.
        </div>
      );
    }

    return (
      <Container className="workflow-container">
        <div className="h3 text-white mb-5">Configure Green Line Stations</div>
        {layout}
      </Container>
    );
  };

interface ConfigurePlaceCardProps {
  place: Place;
  existingScreens: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  } | null;
  handleRemoveLocation: () => void;
}

const ConfigurePlaceCard: ComponentType<ConfigurePlaceCardProps> = ({
  place,
  existingScreens,
  handleRemoveLocation,
}: ConfigurePlaceCardProps) => {
  const existingLiveScreens = existingScreens?.live_screens ?? [];
  const [pendingScreens, setPendingScreens] = useState<ScreenConfiguration[]>(
    existingScreens?.pending_screens ?? []
  );
  const [newScreens, setNewScreens] = useState<ScreenConfiguration[]>([]);

  const hasRows =
    existingLiveScreens.length > 0 ||
    pendingScreens.length > 0 ||
    newScreens.length > 0;

  return (
    <Container className="configure-place-card p-0">
      <Row className="header">
        <Col className="h5 my-auto header-name">{place.name.toUpperCase()}</Col>
        <Col className="body--medium my-auto">Station ID: {place.id}</Col>
        <Col className="d-flex">
          <Button
            className="remove-location-button"
            onClick={handleRemoveLocation}
          >
            Remove Location
          </Button>
        </Col>
      </Row>
      {hasRows && (
        <Row className="screens-table-container">
          <Table responsive="md" borderless className="screens-table m-0">
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
                  handleDelete={() => undefined}
                  onChange={() => undefined}
                />
              ))}
              {pendingScreens.map((screen, index) => (
                <ConfigureScreenRow
                  key={`pendingScreens.${screen.id}`}
                  config={screen}
                  handleDelete={() => {
                    setPendingScreens((prevState) => {
                      const newState = [...prevState];
                      newState.splice(index, 1);
                      return newState;
                    });
                  }}
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
                  handleDelete={() => {
                    setNewScreens((prevState) => {
                      const newState = [...prevState];
                      newState.splice(index, 1);
                      return newState;
                    });
                  }}
                  onChange={(screen: ScreenConfiguration) => {
                    setNewScreens((prevState) => {
                      const newState = [...prevState];
                      newState[index] = screen;
                      return newState;
                    });
                  }}
                />
              ))}
            </tbody>
          </Table>
        </Row>
      )}
      <Row className="add-screen-button-row">
        <Button
          className="add-screen-button body--medium"
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
        </Button>
      </Row>
    </Container>
  );
};

interface CustomToggleProps {
  children?: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const CustomToggle = React.forwardRef<HTMLButtonElement, CustomToggleProps>(
  (
    { children, onClick }: CustomToggleProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => (
    <button
      className="just-added-dropdown-toggle"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      <ThreeDotsVertical fill="#F8F9FA" />
    </button>
  )
);

interface ConfigureScreenRowProps {
  config: ScreenConfiguration;
  isLive?: boolean;
  onChange: (screen: ScreenConfiguration) => void;
  handleDelete: () => void;
}
const ConfigureScreenRow: ComponentType<ConfigureScreenRowProps> = ({
  config,
  isLive,
  onChange,
  handleDelete,
}: ConfigureScreenRowProps) => {
  const direction = config.app_params?.header.direction_id;
  const platformLocation = config.app_params.plaform_location;

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
              selected: platformLocation === "front",
            })}
            onClick={() => {
              config.app_params.plaform_location = "front";
              onChange(config);
            }}
            disabled={isLive}
          >
            Front
          </Button>
          <Button
            className={classNames("row-button", {
              selected: platformLocation === "back",
            })}
            onClick={() => {
              config.app_params.plaform_location = "back";
              onChange(config);
            }}
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
          <div>
            <Dot fill="#8ECDFF" /> Just added
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle as={CustomToggle} />
              <Dropdown.Menu className="just-added-dropdown-menu">
                <Dropdown.Item
                  eventKey="1"
                  className="just-added-dropdown-item"
                  onClick={() => handleDelete()}
                >
                  <TrashFill fill="#F8F9FA" /> Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </td>
    </tr>
  );
};

export { ExistingScreens };

export default ConfigureScreensWorkflowPage;
