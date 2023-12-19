import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../ConfigureScreensPage";
import { Container } from "react-bootstrap";
import PlacesSearchBar, { SearchItem } from "../PlacesSearchBar";
import WorkflowPlacesList from "../WorkflowPlacesList";
import { DirectionID } from "../../../../models/direction_id";
import { Place } from "../../../../models/place";
import BottomActionBar from "../BottomActionBar";
import { useNavigate } from "react-router-dom";

interface StationSelectPageProps {
  places: Place[];
  selectedPlaces: Set<string>;
  setSelectedPlaces: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const StationSelectPage: ComponentType<StationSelectPageProps> = ({
  places,
  selectedPlaces,
  setSelectedPlaces,
}: StationSelectPageProps) => {
  const [sortDirection, setSortDirection] = useState<DirectionID>(0);
  const handleSearchResultClick = (place: SearchItem) => {
    const existingSelectedPlaces = new Set(selectedPlaces);
    setSelectedPlaces(existingSelectedPlaces.add(place.id));
  };
  return (
    <Container className="workflow-container">
      <div className="mb-5">
        <div className="h2 text-white mb-2">Select Green Line Stations</div>
        <div className="body--regular text-white">
          Green Line E-Ink screens can only be added at stations on Green Line
          branches
        </div>
      </div>
      <div className="search-bar-container mb-3">
        <div className="body--medium mb-2">
          Enter Station ID or name to select stations
        </div>
        <PlacesSearchBar
          places={places}
          selectedItems={Array.from(selectedPlaces)}
          handleSearchResultClick={handleSearchResultClick}
        />
      </div>
      <WorkflowPlacesList
        places={places}
        setSortDirection={setSortDirection}
        sortDirection={sortDirection}
        selectedPlaces={selectedPlaces}
        onRowClick={(place: Place, checked: boolean) => {
          // Make a new Set so React knows state was changed.
          const newSet = new Set(selectedPlaces);
          checked ? newSet.add(place.id) : newSet.delete(place.id);

          setSelectedPlaces(newSet);
        }}
      />
    </Container>
  );
};

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
      layout = <div>Configure Screens Page</div>;
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
