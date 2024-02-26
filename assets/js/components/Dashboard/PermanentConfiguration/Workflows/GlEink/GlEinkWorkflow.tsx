import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../../ConfigureScreensPage";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndNewScreens,
} from "./ConfigureScreensPage";
import BottomActionBar from "../../BottomActionBar";
import { useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";
import { Place } from "../../../../../models/place";
import { Alert } from "react-bootstrap";
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

  const validateConfigs = (placesAndScreens: PlaceIdsAndNewScreens) => {
    // Get list of all screen ids that are duplicates (locally)
    const duplicateScreenIds: string[] = [];
    const allLocalScreenIds: string[] = [];
    Object.entries(placesAndScreens).forEach(([placeId, screens]) => {
      Object.keys(screens["updated_screens"]).forEach((screenId) => {
        allLocalScreenIds.push(screenId);
      });

      screens["new_screens"]?.forEach((screen) => {
        if (allLocalScreenIds.includes(screen.new_id ?? "")) {
          duplicateScreenIds.push(screen.new_id ?? "");
        } else {
          allLocalScreenIds.push(screen.new_id ?? "");
        }
      });
    });

    const fieldsWithErrors = new Set<string>();
    for (const [place_id, screens] of Object.entries(placesAndScreens)) {
      // Check if screen id is a duplicate
      screens["new_screens"]?.map((screen, index) => {
        if (duplicateScreenIds.includes(screen.new_id ?? "")) {
          fieldsWithErrors.add("screen_id");
          validationErrors[place_id][index].isDuplicateScreenId = true;
        } else {
          validationErrors[place_id][index].isDuplicateScreenId = false;
        }
      });

      const fieldsByScreen = screens["new_screens"]?.map((screen) => {
        const presentFields = [];

        // Validate that screen id is in correct format
        if (screen.new_id?.match(/^EIG-\d+$/)) {
          presentFields.push("screen_id");
        }

        // Get what fields are present in the config for this screen
        return presentFields.concat(
          Object.keys(screen["app_params"]).concat(
            Object.keys(screen["app_params"].header)
          )
        );
      });

      // Check if any screens are missing required fields (screen_id, direction_id, platform_location)
      if (fieldsByScreen) {
        fieldsByScreen.forEach((fields, index) => {
          const missingFieldsForScreen = [
            "screen_id",
            "direction_id",
            "platform_location",
          ].filter((field) => {
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
    return { validationErrors, fieldsWithErrors };
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
          placesAndScreensToUpdate={placesAndScreensToUpdate}
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
        const { validationErrors, fieldsWithErrors } = validateConfigs(
          placesAndScreensToUpdate
        );
        setValidationErrorMessage(generateErrorMessage(fieldsWithErrors));

        if (fieldsWithErrors.size === 0) {
          putPendingScreens(
            placesAndScreensToUpdate,
            "gl_eink_v2",
            configVersion
          ).then(() => navigate("/pending"));
        } else {
          setShowValidationAlert(true);
          dispatch({
            type: "SET_VALIDATION_ERRORS",
            validationErrors: validationErrors,
          });
        }
      };
      layout = (
        <div>
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
