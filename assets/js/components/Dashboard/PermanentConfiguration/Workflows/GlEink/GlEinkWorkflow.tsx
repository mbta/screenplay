import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../../ConfigureScreensPage";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndNewScreens,
} from "./ConfigureScreensPage";
import BottomActionBar from "../../BottomActionBar";
import { useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";
import { Place } from "../../../../../models/place";
import { Alert, Button, Modal } from "react-bootstrap";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import {
  useConfigValidationContext,
  useConfigValidationDispatchContext,
} from "../../../../../hooks/useScreenplayContext";
import { putPendingScreens } from "../../../../../utils/api";

const GlEinkWorkflow: ComponentType<WorkflowProps> = ({
  places,
}: WorkflowProps) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [configVersion, setConfigVersion] = useState<string>("");

  const [placesAndScreensToUpdate, setPlacesAndScreensToUpdate] =
    useState<PlaceIdsAndNewScreens>({});

  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState<number>(0);

  const [showValidationAlert, setShowValidationAlert] = useState(true);
  const { validationErrors } = useConfigValidationContext();
  const dispatch = useConfigValidationDispatchContext();
  const [validationErrorMessage, setValidationErrorMessage] =
    useState<string>("");

  const [showErrorModal, setShowErrorModal] = useState<boolean>(true);

  const handleRemoveLocation = (place: Place) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    newSelectedPlaces.delete(place.id);
    delete validationErrors[place.id];
    dispatch({
      type: "SET_VALIDATION_ERRORS",
      validationErrors: validationErrors,
    });
    setSelectedPlaces(newSelectedPlaces);
    setPlacesAndScreensToUpdate((placesAndScreens) => {
      const { [place.id]: _discarded, ...newPlacesAndScreens } =
        placesAndScreens;
      return newPlacesAndScreens;
    });
  };

  const generateErrorMessage = (errorSet: Set<string>) => {
    if (errorSet.size === 0) {
      return "";
    }

    const capitalizedErrors = Array.from(errorSet).map((error) => {
      const capitalizedWords = error
        .split("_")
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
      return capitalizedWords.join(" ");
    });

    if (capitalizedErrors.length === 1) {
      return "Correct the following error: " + capitalizedErrors[0] + ".";
    } else {
      return (
        "Correct the following errors: " + capitalizedErrors.join(", ") + "."
      );
    }
  };

  const validateDuplicateScreenIds = (
    placesAndScreens: PlaceIdsAndNewScreens,
    duplicateScreenIds: string[] = []
  ) => {
    for (const [place_id, screens] of Object.entries(placesAndScreens)) {
      // Check if screen id is a duplicate
      screens["new_pending_screens"]?.map((screen, index) => {
        if (duplicateScreenIds.includes(screen.new_id ?? "")) {
          validationErrors[place_id][index].isDuplicateScreenId = true;
        } else {
          validationErrors[place_id][index].isDuplicateScreenId = false;
        }
      });
    }
  };

  const validateRequiredFields = (placesAndScreens: PlaceIdsAndNewScreens) => {
    const fieldsWithErrors = new Set<string>();
    for (const [place_id, screens] of Object.entries(placesAndScreens)) {
      const fieldsByScreen = screens["new_pending_screens"]?.map((screen) => {
        const presentFields = [];

        // Validate that screen id is in correct format
        if (screen.new_id?.match(/^EIG-\d+$/)) {
          presentFields.push("screen_id");
        }

        // Get what fields are present in the config for this screen
        return [
          ...presentFields,
          ...Object.keys(screen["app_params"]),
          ...Object.keys(screen["app_params"].header),
        ];
      });

      // Check if any screens are missing required fields (screen_id, direction_id, platform_location)
      const requiredFields = ["screen_id", "direction_id", "platform_location"];
      if (fieldsByScreen) {
        fieldsByScreen.forEach((fields, index) => {
          const missingFieldsForScreen = requiredFields.filter((field) => {
            if (!fields.includes(field)) {
              fieldsWithErrors.add(field);
              return true;
            } else {
              return false;
            }
          });

          validationErrors[place_id][index].missingFields =
            missingFieldsForScreen;
        });
      }
    }
    return fieldsWithErrors;
  };

  let backButtonLabel;
  let forwardButtonLabel;
  let cancelButtonLabel;
  let onBack;
  let onForward;
  let onCancel;
  let layout;
  const forwardButtonDisabled = selectedPlaces.size === 0;
  switch (configStep) {
    case 0:
      cancelButtonLabel = "Cancel";
      forwardButtonLabel = "Next";
      onCancel = () => {
        navigate(-1);
      };
      onForward = () => {
        setConfigStep(configStep + 1);
      };
      layout = (
        <StationSelectPage
          places={places}
          selectedPlaces={selectedPlaces}
          setSelectedPlaces={setSelectedPlaces}
          setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
        />
      );
      break;
    case 1:
      backButtonLabel = "Back";
      forwardButtonLabel = "Review Screens";
      cancelButtonLabel = "Cancel";
      onCancel = () => {
        navigate(-1);
      };
      onBack = () => {
        Object.keys(placesAndScreensToUpdate).forEach((placeId) => {
          validationErrors[placeId] = [];
        });
        dispatch({
          type: "SET_VALIDATION_ERRORS",
          validationErrors: validationErrors,
        });
        setConfigStep(configStep - 1);
      };
      onForward = () => {
        const fieldsWithErrors = validateRequiredFields(
          placesAndScreensToUpdate
        );

        if (fieldsWithErrors.size === 0) {
          putPendingScreens(
            placesAndScreensToUpdate,
            "gl_eink_v2",
            configVersion
          ).then((response) => {
            if (response.ok) {
              navigate("/pending");
            } else {
              return response
                .json()
                .then((data) => {
                  validateDuplicateScreenIds(
                    placesAndScreensToUpdate,
                    data.duplicate_screen_ids
                  );
                  fieldsWithErrors.add("screen_id");
                  setValidationErrorMessage(
                    generateErrorMessage(fieldsWithErrors)
                  );
                  setShowValidationAlert(true);
                  dispatch({
                    type: "SET_VALIDATION_ERRORS",
                    validationErrors: validationErrors,
                  });
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          });
        } else {
          validateDuplicateScreenIds(placesAndScreensToUpdate);
          setValidationErrorMessage(generateErrorMessage(fieldsWithErrors));
          setShowValidationAlert(true);
          dispatch({
            type: "SET_VALIDATION_ERRORS",
            validationErrors: validationErrors,
          });
        }
      };
      layout = (
        <div>
          <Modal
            show={showErrorModal}
            backdrop="static"
            className="error-modal"
          >
            <Modal.Header closeButton closeVariant="white">
              <Modal.Title>
                Someone else is configuring these screens
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              In order not to overwrite each others work, please refresh your
              browser and fill-out the form again.
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => setShowErrorModal(false)}
                className="error-modal__cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="error-modal__refresh-button"
                onClick={() => window.location.reload()}
              >
                Refresh now
              </Button>
            </Modal.Footer>
          </Modal>
          <ConfigureScreensWorkflowPage
            selectedPlaces={places.filter((place) =>
              selectedPlaces.has(place.id)
            )}
            setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
            handleRemoveLocation={handleRemoveLocation}
            setConfigVersion={setConfigVersion}
          />
          {validationErrorMessage !== "" && (
            <div className="config-validation-alert-container">
              <Alert
                show={showValidationAlert}
                variant="primary"
                onClose={() => setShowValidationAlert(false)}
                dismissible
                className="config-validation-alert"
              >
                <ExclamationCircleFill className="config-validation-alert__icon" />
                <div className="config-validation-alert__text">
                  {validationErrorMessage}
                </div>
              </Alert>
            </div>
          )}
        </div>
      );
      break;
  }

  return (
    <div>
      {layout}
      <div className="bottom-action-bar">
        <BottomActionBar
          backButtonLabel={backButtonLabel}
          forwardButtonLabel={forwardButtonLabel}
          cancelButtonLabel={cancelButtonLabel}
          onCancel={onCancel}
          onBack={onBack}
          onForward={onForward}
          forwardButtonDisabled={forwardButtonDisabled}
        />
      </div>
    </div>
  );
};

export default GlEinkWorkflow;
