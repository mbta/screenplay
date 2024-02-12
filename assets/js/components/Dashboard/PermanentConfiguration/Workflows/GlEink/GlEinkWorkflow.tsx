/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../../ConfigureScreensPage";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndNewScreens,
} from "./ConfigureScreensPage";
import BottomActionBar from "../../BottomActionBar";
import { useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";
import { Place } from "../../../../../models/place";

// I made this change before realizing that the "Review Pending" page was actually
// not part of the "wizard" and instead a standalone page at a separate route.
// Can revert.
enum ConfigStep {
  SelectStation = 0,
  ConfigureScreens,
}

const GlEinkWorkflow: ComponentType<WorkflowProps> = ({
  places,
}: WorkflowProps) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [configVersion, setConfigVersion] = useState<string>("");

  const [placesAndScreensToUpdate, setPlacesAndScreensToUpdate] =
    useState<PlaceIdsAndNewScreens>({});

  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState<ConfigStep>(ConfigStep.SelectStation);

  const handleRemoveLocation = (place: Place) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    newSelectedPlaces.delete(place.id);
    setSelectedPlaces(newSelectedPlaces);
    setPlacesAndScreensToUpdate((placesAndScreens) => {
      const { [place.id]: _discarded, ...newPlacesAndScreens } =
        placesAndScreens;
      return newPlacesAndScreens;
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
    case ConfigStep.SelectStation:
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
        />
      );
      break;
    case ConfigStep.ConfigureScreens:
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
          selectedPlaces={places.filter((place) =>
            selectedPlaces.has(place.id)
          )}
          setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
          handleRemoveLocation={handleRemoveLocation}
          setConfigVersion={setConfigVersion}
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
