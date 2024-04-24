/* eslint-disable react/no-unescaped-entities */
import React, {
  ComponentType,
  ForwardedRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { Place } from "../../../../../models/place";
import {
  GLScreenConfiguration,
  ScreenConfiguration,
} from "../../../../../models/screen_configuration";
import { ValidationErrorsForScreen } from "../../../../../models/configValidationErrors";
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
import {
  ExistingScreens,
  ExistingScreensAtPlace,
  fetchExistingScreens,
} from "../../../../../utils/api";
import {
  useConfigValidationContext,
  useConfigValidationDispatchContext,
} from "../../../../../hooks/useScreenplayContext";

interface PlaceIdsAndExistingScreens {
  [place_id: string]: ExistingScreensAtPlace;
}

interface PlaceIdsAndNewScreens {
  [place_id: string]: {
    updated_pending_screens: ScreenConfiguration[];
    new_pending_screens?: ScreenConfiguration[];
    existing_pending_screens: ScreenConfiguration[];
  };
}

interface ConfigureScreensWorkflowPageProps {
  selectedPlaces: Place[];
  setPlacesAndScreensToUpdate: React.Dispatch<
    React.SetStateAction<PlaceIdsAndNewScreens>
  >;
  handleRemoveLocation: (place: Place) => void;
  setConfigVersion: React.Dispatch<React.SetStateAction<string>>;
  isEditing: boolean;
}

const ConfigureScreensWorkflowPage: ComponentType<
  ConfigureScreensWorkflowPageProps
> = ({
  selectedPlaces,
  setPlacesAndScreensToUpdate,
  handleRemoveLocation,
  setConfigVersion,
  isEditing,
}: ConfigureScreensWorkflowPageProps) => {
  const [existingScreens, setExistingScreens] = useState<ExistingScreens>({});

  const { newScreenValidationErrors, pendingScreenValidationErrors } =
    useConfigValidationContext();
  const dispatch = useConfigValidationDispatchContext();

  // This hook will run in two different scenarios:
  // 1. Runs at initial render if navigated to from the StationSelectPage.
  // 2. Runs after initial render if navigated to from the Edit Pending button on the Pending page.
  // The items in selectedPlaces are guaranteed to stay the same while this page is being used.
  useEffect(() => {
    if (selectedPlaces.length) {
      fetchExistingScreens(
        "gl_eink_v2",
        selectedPlaces.map((place) => place.id),
      ).then(({ places_and_screens, version_id }) => {
        initializeExistingScreenValidationErrors(places_and_screens);
        setConfigVersion(version_id);
        setExistingScreens(places_and_screens);
      });
    }
  }, [selectedPlaces.length]);

  const getTitle = () =>
    isEditing ? "Edit Pending" : "Configure Green Line Stations";

  const initializeExistingScreenValidationErrors = (
    placesAndScreens: PlaceIdsAndExistingScreens,
  ) => {
    for (const place_id in placesAndScreens) {
      const screens = placesAndScreens[place_id];

      Object.keys(screens.pending_screens).map((_screen, index) => {
        pendingScreenValidationErrors[place_id][index] = {
          missingFields: [],
          isDuplicateScreenId: false,
        };
      });
    }

    dispatch({
      type: "SET_VALIDATION_ERRORS",
      newScreenValidationErrors,
      pendingScreenValidationErrors,
    });
  };

  let layout;
  if (selectedPlaces.length) {
    layout = selectedPlaces.map((place) => {
      return (
        <ConfigurePlaceCard
          key={place.id}
          place={place}
          existingScreens={existingScreens[place.id]}
          setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
          handleRemoveLocation={() => handleRemoveLocation(place)}
        />
      );
    });
  } else {
    layout = (
      <div>
        All locations have been removed. Select "Back" to select new locations.
      </div>
    );
  }

  return (
    <Container className="workflow-container">
      <div className="h3 text-white mb-5">{getTitle()}</div>
      {layout}
    </Container>
  );
};

interface ConfigurePlaceCardProps {
  place: Place;
  existingScreens: ExistingScreensAtPlace;
  setPlacesAndScreensToUpdate: React.Dispatch<
    React.SetStateAction<PlaceIdsAndNewScreens>
  >;
  handleRemoveLocation: () => void;
}

const ConfigurePlaceCard: ComponentType<ConfigurePlaceCardProps> = ({
  place,
  existingScreens,
  setPlacesAndScreensToUpdate,
  handleRemoveLocation,
}: ConfigurePlaceCardProps) => {
  const [existingPendingScreens, setExistingPendingScreens] = useState<{
    [screen_id: string]: ScreenConfiguration;
  }>({});

  const [updatedPendingScreens, setUpdatedPendingScreens] = useState<
    ScreenConfiguration[]
  >([]);

  const [newScreens, setNewScreens] = useState<ScreenConfiguration[]>([]);
  const existingLiveScreens: {
    [screen_id: string]: ScreenConfiguration;
  } = existingScreens?.live_screens ?? {};
  const { newScreenValidationErrors, pendingScreenValidationErrors } =
    useConfigValidationContext();
  const dispatch = useConfigValidationDispatchContext();

  useEffect(() => {
    if (!existingScreens) return;

    setExistingPendingScreens(existingScreens.pending_screens);
  }, [existingScreens]);

  const existingScreensToArray = (existingPendingScreens: {
    [screen_id: string]: ScreenConfiguration;
  }) => {
    return Object.entries(existingPendingScreens).map(([screen_id, screen]) => {
      screen.screen_id = screen_id;
      return screen;
    });
  };

  useEffect(() => {
    setPlacesAndScreensToUpdate((placesAndScreens) => {
      return {
        ...placesAndScreens,
        [place.id]: {
          updated_pending_screens: updatedPendingScreens,
          new_pending_screens: newScreens,
          existing_pending_screens: existingScreensToArray(
            existingPendingScreens,
          ),
        },
      };
    });
  }, [updatedPendingScreens, existingPendingScreens, newScreens]);

  const hasRows =
    Object.keys(existingLiveScreens).length > 0 ||
    Object.values(existingPendingScreens).filter((config) => !config.is_deleted)
      .length > 0 ||
    newScreens.length > 0;

  const deleteExistingPendingRow = (
    screenID: string,
    screen: ScreenConfiguration,
  ) => {
    setExistingPendingScreens((prevState) => {
      return {
        ...prevState,
        [screenID]: { ...prevState[screenID], is_deleted: true },
      };
    });

    setUpdatedPendingScreens((prevState) => {
      const index = prevState.findIndex(
        (screen) => screen.screen_id === screenID,
      );

      if (index === -1) {
        const newDeletedScreen: GLScreenConfiguration = {
          screen_id: screenID,
          is_deleted: true,
          app_id: "gl_eink_v2",
          app_params: screen.app_params,
        };

        return [...prevState, newDeletedScreen];
      } else {
        return [
          ...prevState.slice(0, index),
          { ...prevState[index], is_deleted: true },
          ...prevState.slice(index + 1),
        ];
      }
    });
  };

  const changeExistingPendingRow = (
    screenID: string,
    screen: ScreenConfiguration,
    index: number,
  ) => {
    if (screen.new_id == screenID) {
      setUpdatedPendingScreens((prevState) => {
        return [
          ...prevState.slice(0, index),
          { ...prevState[index], new_id: undefined },
          ...prevState.slice(index + 1),
        ];
      });
    } else {
      setUpdatedPendingScreens((prevState) => {
        return [
          ...prevState.slice(0, index),
          screen,
          ...prevState.slice(index + 1),
        ];
      });
    }
    setExistingPendingScreens((prevState) => {
      return {
        ...prevState,
        [screenID]: screen,
      };
    });
  };

  const deleteNewRow = (index: number) => {
    newScreenValidationErrors[place.id].splice(index, 1);
    dispatch({
      type: "SET_VALIDATION_ERRORS",
      newScreenValidationErrors,
      pendingScreenValidationErrors,
    });
    setNewScreens((prevState) => {
      return [...prevState.slice(0, index), ...prevState.slice(index + 1)];
    });
  };

  const changeNewRow = (screen: ScreenConfiguration, index: number) => {
    setNewScreens((prevState) => {
      return [
        ...prevState.slice(0, index),
        screen,
        ...prevState.slice(index + 1),
      ];
    });
  };

  const addNewRow = () => {
    setNewScreens((prevState) => [
      ...prevState,
      {
        new_id: "EIG-",
        app_params: { header: { route_id: place.routes[0] } },
        app_id: "gl_eink_v2",
      },
    ]);

    newScreenValidationErrors[place.id].push({
      missingFields: [],
      isDuplicateScreenId: false,
    });
    dispatch({
      type: "SET_VALIDATION_ERRORS",
      newScreenValidationErrors,
      pendingScreenValidationErrors,
    });
  };

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
          <Table responsive borderless className="screens-table m-0">
            <thead className="screens-table-header">
              <tr className="body--regular">
                <th className="screen-id">Screen ID</th>
                <th className="direction">Direction</th>
                <th className="platform-location">Platform Location</th>
                <th className="status"></th>
              </tr>
            </thead>
            <tbody className="screens-table-body">
              {Object.entries(existingLiveScreens).map(([screenID, screen]) => {
                return (
                  <ConfigureScreenRow
                    key={screenID}
                    screenID={screenID}
                    config={screen}
                    isLive
                    handleDelete={() => undefined}
                    onChange={() => undefined}
                    validationErrors={{
                      missingFields: [],
                      isDuplicateScreenId: false,
                    }}
                  />
                );
              })}
              {Object.entries(existingPendingScreens).map(
                ([screenID, screen], index) => {
                  return (
                    <ConfigureScreenRow
                      key={`pendingScreens.${index}`}
                      screenID={screen.new_id ?? screenID}
                      config={screen}
                      handleDelete={() =>
                        deleteExistingPendingRow(screenID, screen)
                      }
                      onChange={(screen: ScreenConfiguration) =>
                        changeExistingPendingRow(screenID, screen, index)
                      }
                      className={screen.is_deleted ? "hidden" : ""}
                      validationErrors={
                        pendingScreenValidationErrors[place.id][index]
                      }
                    />
                  );
                },
              )}
              {newScreens.map((screen, index) => {
                return (
                  <ConfigureScreenRow
                    key={`newScreens.${index}`}
                    screenID={screen.new_id ?? ""}
                    config={screen}
                    handleDelete={() => deleteNewRow(index)}
                    onChange={(screen: ScreenConfiguration) =>
                      changeNewRow(screen, index)
                    }
                    className={screen.is_deleted ? "hidden" : ""}
                    validationErrors={
                      newScreenValidationErrors[place.id][index]
                    }
                  />
                );
              })}
            </tbody>
          </Table>
        </Row>
      )}
      <Row className="add-screen-button-row">
        <Button className="add-screen-button body--medium" onClick={addNewRow}>
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
    ref: ForwardedRef<HTMLButtonElement>,
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
  ),
);

interface ConfigureScreenRowProps {
  screenID: string;
  config: ScreenConfiguration;
  isLive?: boolean;
  onChange: (screen: ScreenConfiguration) => void;
  handleDelete: () => void;
  className?: string;
  validationErrors: ValidationErrorsForScreen;
}
const ConfigureScreenRow: ComponentType<ConfigureScreenRowProps> = ({
  screenID,
  config,
  isLive,
  onChange,
  handleDelete,
  className = "",
  validationErrors,
}: ConfigureScreenRowProps) => {
  const direction = config.app_params?.header.direction_id;
  const platformLocation = config.app_params.platform_location;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const screenIdError = () => {
    if (validationErrors.missingFields.includes("screen_id")) {
      return <div className="error-text">Screen ID is required</div>;
    } else if (validationErrors.isDuplicateScreenId) {
      return <div className="error-text">Duplicate Screen ID</div>;
    } else {
      return null;
    }
  };

  return (
    <tr className={classNames("screen-row", className)}>
      <td className="screen-id">
        <Form.Control
          className="screen-id-input"
          disabled={isLive}
          value={screenID}
          onChange={(e) => {
            const newConfig = { ...config, new_id: e.target.value };
            onChange(newConfig);
          }}
          placeholder="EIG-"
        />
        {screenIdError()}
      </td>
      <td className="direction">
        <ButtonGroup className="row-button-group">
          <Button
            className={classNames("row-button", {
              selected: direction === 0,
            })}
            onClick={() => {
              const newConfig = { ...config };
              newConfig.app_params.header.direction_id = 0;
              onChange(newConfig);
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
              const newConfig = { ...config };
              newConfig.app_params.header.direction_id = 1;
              onChange(newConfig);
            }}
            disabled={isLive}
          >
            Eastbound <ArrowRight />
          </Button>
        </ButtonGroup>
        {validationErrors.missingFields.includes("direction_id") && (
          <div className="error-text">Direction is required</div>
        )}
      </td>
      <td className="platform-location">
        <ButtonGroup className="row-button-group">
          <Button
            className={classNames("row-button", {
              selected: platformLocation === "front",
            })}
            onClick={() => {
              const newConfig = { ...config };
              newConfig.app_params.platform_location = "front";
              onChange(newConfig);
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
              const newConfig = { ...config };
              newConfig.app_params.platform_location = "back";
              onChange(newConfig);
            }}
            disabled={isLive}
          >
            Back
          </Button>
        </ButtonGroup>
        {validationErrors.missingFields.includes("platform_location") && (
          <div className="error-text">Platform Location is required</div>
        )}
      </td>
      <td className="status">
        {isLive ? (
          <div>
            <LightningChargeFill fill="#EFF193" /> Live · Read-only
          </div>
        ) : (
          <div>
            <Dot fill="#8ECDFF" /> Just added
            <Dropdown as={ButtonGroup} ref={dropdownRef} drop="down">
              <Dropdown.Toggle as={CustomToggle} />
              <Dropdown.Menu className="just-added-dropdown-menu">
                <Dropdown.Item
                  className="just-added-dropdown-item"
                  onClick={handleDelete}
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

export { PlaceIdsAndNewScreens };

export default ConfigureScreensWorkflowPage;
