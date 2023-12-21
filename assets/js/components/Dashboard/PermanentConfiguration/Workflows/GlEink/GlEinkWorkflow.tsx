import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../../ConfigureScreensPage";
import ConfigureScreensWorkflowPage from "./ConfigureScreensWorkflowPage";
import BottomActionBar from "../../BottomActionBar";
import { useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";

const GlEinkWorkflow: ComponentType<WorkflowProps> = ({
  places,
}: WorkflowProps) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState<number>(0);

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
          selectedPlaces={places.filter((place) =>
            selectedPlaces.has(place.id)
          )}
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
        ></BottomActionBar>
      </div>
    </div>
  );
};

export default GlEinkWorkflow;
