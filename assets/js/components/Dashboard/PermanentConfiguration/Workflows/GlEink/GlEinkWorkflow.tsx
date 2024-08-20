import React, { ComponentType, useLayoutEffect, useState } from "react";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndNewScreens,
} from "Components/PermanentConfiguration/Workflows/GlEink/ConfigureScreensPage";
import BottomActionBar from "Components/PermanentConfiguration/BottomActionBar";
import { useLocation, useNavigate } from "react-router-dom";
import StationSelectPage from "Components/PermanentConfiguration/Workflows/GlEink/StationSelectPage";
import { Alert, Button, Modal } from "react-bootstrap";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import {
  useConfigValidationContext,
  useConfigValidationDispatchContext,
} from "Hooks/useScreenplayContext";
import { putPendingScreens } from "Utils/api";
import { useScreenplayContext } from "Hooks/useScreenplayContext";

interface EditNavigationState {
  place_id: string;
}

const GlEinkWorkflow: ComponentType = () => {
  const { places } = useScreenplayContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [configVersion, setConfigVersion] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [configStep, setConfigStep] = useState<number>(0);

  const [placesAndScreensToUpdate, setPlacesAndScreensToUpdate] =
    useState<PlaceIdsAndNewScreens>({});

  const getPlacesList = () => {
    return places.filter((place) =>
      place.routes.some((route) => route.startsWith("Green")),
    );
  };

  const [showValidationAlert, setShowValidationAlert] = useState(true);
  const { newScreenValidationErrors, pendingScreenValidationErrors } =
    useConfigValidationContext();
  const dispatch = useConfigValidationDispatchContext();
  const [validationErrorMessage, setValidationErrorMessage] =
    useState<string>("");
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (location.state) {
      const { place_id } = location.state as EditNavigationState;

      setConfigStep(1);
      setSelectedPlaces(new Set([place_id]));
      setIsEditing(true);
      newScreenValidationErrors[place_id] = [];
      pendingScreenValidationErrors[place_id] = [];
      dispatch({
        type: "SET_VALIDATION_ERRORS",
        newScreenValidationErrors,
        pendingScreenValidationErrors,
      });
    }
  }, [
    location,
    dispatch,
    newScreenValidationErrors,
    pendingScreenValidationErrors,
  ]);

  const generateErrorMessage = (errorSet: Set<string>) => {
    if (errorSet.size === 0) {
      return "";
    }

    const capitalizedErrors = Array.from(errorSet).map((error) => {
      const capitalizedWords = error
        .split("_")
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
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
    duplicateScreenIds: string[] = [],
  ) => {
    for (const [place_id, screens] of Object.entries(placesAndScreens)) {
      screens["new_pending_screens"]?.map((screen, index) => {
        if (duplicateScreenIds.includes(screen.new_id ?? "")) {
          newScreenValidationErrors[place_id][index].isDuplicateScreenId = true;
        } else {
          newScreenValidationErrors[place_id][index].isDuplicateScreenId =
            false;
        }
      });

      screens["existing_pending_screens"].map((screen, index) => {
        if (
          duplicateScreenIds.includes(screen.new_id ?? screen.screen_id ?? "")
        ) {
          pendingScreenValidationErrors[place_id][index].isDuplicateScreenId =
            true;
        } else {
          pendingScreenValidationErrors[place_id][index].isDuplicateScreenId =
            false;
        }
      });
    }
  };

  const validateRequiredFields = (placesAndScreens: PlaceIdsAndNewScreens) => {
    const fieldsWithErrors = new Set<string>();
    for (const [place_id, screens] of Object.entries(placesAndScreens)) {
      const fieldsByScreen = screens["new_pending_screens"]?.map((screen) => {
        // Get what fields are present in the config for this screen
        return [
          "screen_id",
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

          newScreenValidationErrors[place_id][index].missingFields =
            missingFieldsForScreen;
        });
      }
    }
    return fieldsWithErrors;
  };

  const handleGlEinkSubmitResponse = async (
    response: Response,
    fieldsWithErrors: Set<string>,
  ) => {
    if (response.ok) {
      navigate("/pending");
    } else if (response.status === 400) {
      const data = await response.json();
      if (data.duplicate_screen_ids) {
        handleDuplicateIdsResponse(data.duplicate_screen_ids, fieldsWithErrors);
      } else {
        handleVersionMismatchResponse();
      }
    } else {
      setValidationErrorMessage(
        "Something went wrong. Please select 'Review Screens' again.",
      );
      setShowValidationAlert(true);
    }
  };

  const handleDuplicateIdsResponse = (
    duplicate_screen_ids: string[],
    fieldsWithErrors: Set<string>,
  ) => {
    validateDuplicateScreenIds(placesAndScreensToUpdate, duplicate_screen_ids);
    fieldsWithErrors.add("screen_id");
    setValidationErrorMessage(generateErrorMessage(fieldsWithErrors));
    setShowValidationAlert(true);
    dispatch({
      type: "SET_VALIDATION_ERRORS",
      newScreenValidationErrors,
      pendingScreenValidationErrors,
    });
  };

  const handleVersionMismatchResponse = () => {
    setShowErrorModal(true);
  };

  let backButtonLabel;
  let forwardButtonLabel;
  let cancelButtonLabel;
  let onBack;
  let onForward;
  let onCancel;
  let layout;
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
          places={getPlacesList()}
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
          newScreenValidationErrors[placeId] = [];
          pendingScreenValidationErrors[placeId] = [];
        });

        dispatch({
          type: "SET_VALIDATION_ERRORS",
          newScreenValidationErrors,
          pendingScreenValidationErrors,
        });
        setShowValidationAlert(false);
        setConfigStep(configStep - 1);
      };
      onForward = () => {
        const fieldsWithErrors = validateRequiredFields(
          placesAndScreensToUpdate,
        );

        if (fieldsWithErrors.size === 0) {
          putPendingScreens(
            placesAndScreensToUpdate,
            "gl_eink_v2",
            configVersion,
          ).then((response) => {
            handleGlEinkSubmitResponse(response, fieldsWithErrors);
          });
        } else {
          validateDuplicateScreenIds(placesAndScreensToUpdate);
          setValidationErrorMessage(generateErrorMessage(fieldsWithErrors));
          setShowValidationAlert(true);
          dispatch({
            type: "SET_VALIDATION_ERRORS",
            newScreenValidationErrors,
            pendingScreenValidationErrors,
          });
        }
      };
      layout = (
        <>
          <Modal
            show={showErrorModal}
            className="error-modal"
            onHide={() => setShowErrorModal(false)}
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
              selectedPlaces.has(place.id),
            )}
            setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
            setConfigVersion={setConfigVersion}
            isEditing={isEditing}
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
        </>
      );
      break;
  }

  return (
    <>
      {layout}
      <div className="bottom-action-bar">
        <BottomActionBar
          backButtonLabel={isEditing ? null : backButtonLabel}
          forwardButtonLabel={forwardButtonLabel}
          cancelButtonLabel={cancelButtonLabel}
          onCancel={onCancel}
          onBack={onBack}
          onForward={onForward}
        />
      </div>
    </>
  );
};

export default GlEinkWorkflow;
