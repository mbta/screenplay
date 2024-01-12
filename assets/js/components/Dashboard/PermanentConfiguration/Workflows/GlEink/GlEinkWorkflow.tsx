import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../../ConfigureScreensPage";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndScreens,
} from "./ConfigureScreensPage";
import BottomActionBar from "../../BottomActionBar";
import { useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";
import { Place } from "../../../../../models/place";
import { fetchExistingScreens } from "../../../../../utils/api";

const GlEinkWorkflow: ComponentType<WorkflowProps> = ({
  places,
}: WorkflowProps) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Set<Place>>(new Set());
  const [existingScreens, setExistingScreens] = useState<PlaceIdsAndScreens>(
    {}
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [screensToUpdate, setScreensToUpdate] = useState<PlaceIdsAndScreens>(
    {}
  );

  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState<number>(0);

  const handleRemoveLocation = (place: Place) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    newSelectedPlaces.delete(place);
    setSelectedPlaces(newSelectedPlaces);
    setScreensToUpdate((screens) => {
      delete screens[place.id];
      return screens;
    });
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
        if (selectedPlaces.size > 0) {
          fetchExistingScreens(
            "gl_eink_v2",
            Array.from(selectedPlaces).map((place) => place.id),
            (placesAndScreens) => {
              setExistingScreens(placesAndScreens);
            }
          );
        }

        setConfigStep(configStep + 1);
      };
      layout = (
        <StationSelectPage
          places={places}
          selectedPlaces={selectedPlaces}
          setSelectedPlaces={setSelectedPlaces}
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
        setConfigStep(configStep - 1);
      };
      onForward = () => {
        navigate("/pending");
      };
      layout = (
        <ConfigureScreensWorkflowPage
          selectedPlaces={Array.from(selectedPlaces)}
          existingScreens={existingScreens}
          setScreensToUpdate={setScreensToUpdate}
          handleRemoveLocation={handleRemoveLocation}
        />
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
