import React, { ComponentType, useState } from "react";
import { Container } from "react-bootstrap";
import PlacesSearchBar, {
  SearchItem,
} from "Components/PermanentConfiguration/PlacesSearchBar";
import WorkflowPlacesList from "Components/PermanentConfiguration/WorkflowPlacesList";
import { DirectionID } from "Models/direction_id";
import { Place } from "Models/place";
import BottomActionBar from "Components/PermanentConfiguration/BottomActionBar";
import { useNavigate } from "react-router-dom";
import { useConfigValidationState } from "Hooks/useScreenplayContext";
import { PlaceIdsAndNewScreens } from "./ConfigureScreensPage";
interface StationSelectPageProps {
  places: Place[];
  selectedPlaces: Set<string>;
  setSelectedPlaces: React.Dispatch<React.SetStateAction<Set<string>>>;
  setPlacesAndScreensToUpdate: React.Dispatch<
    React.SetStateAction<PlaceIdsAndNewScreens>
  >;
}

const StationSelectPage: ComponentType<StationSelectPageProps> = ({
  places,
  selectedPlaces,
  setSelectedPlaces,
  setPlacesAndScreensToUpdate,
}: StationSelectPageProps) => {
  const [sortDirection, setSortDirection] = useState<DirectionID>(0);
  const handleSearchResultClick = (item: SearchItem) => {
    const placeToAdd = places.find((place) => place.id === item.id);
    if (placeToAdd) {
      setSelectedPlaces((prev) => new Set([placeToAdd.id, ...prev]));
      newScreenValidationErrors[placeToAdd.id] = [];
      pendingScreenValidationErrors[placeToAdd.id] = [];
      setValidationErrors(
        newScreenValidationErrors,
        pendingScreenValidationErrors,
      );
    }
  };

  const navigate = useNavigate();
  const [configStep, setConfigStep] = useState<number>(0);

  const {
    newScreenValidationErrors,
    pendingScreenValidationErrors,
    setValidationErrors,
  } = useConfigValidationState();

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
        <Container className="workflow-container">
          <div className="mb-5">
            <div className="h2 text-white mb-2">Select Green Line Stations</div>
            <div className="body--regular text-white">
              Green Line E-Ink screens can only be added at stations on Green
              Line branches
            </div>
          </div>
          <div className="search-bar-container mb-3">
            <div className="body--medium mb-2">
              Enter Station ID or name to select stations
            </div>
            <PlacesSearchBar
              places={places}
              handleSearchResultClick={handleSearchResultClick}
            />
          </div>
          <WorkflowPlacesList
            places={places}
            setSortDirection={setSortDirection}
            sortDirection={sortDirection}
            selectedPlaces={selectedPlaces}
            onRowClick={(place: Place, checked?: boolean) => {
              // Make a new Set so React knows state was changed.
              const newSet = new Set(selectedPlaces);

              if (checked) {
                newSet.add(place.id);
                newScreenValidationErrors[place.id] = [];
                pendingScreenValidationErrors[place.id] = [];
                setValidationErrors(
                  newScreenValidationErrors,
                  pendingScreenValidationErrors,
                );
              } else {
                newSet.delete(place.id);
                delete newScreenValidationErrors[place.id];
                delete pendingScreenValidationErrors[place.id];
                setValidationErrors(
                  newScreenValidationErrors,
                  pendingScreenValidationErrors,
                );
              }
              setPlacesAndScreensToUpdate((placesAndScreens) => {
                const { [place.id]: _discarded, ...newPlacesAndScreens } =
                  placesAndScreens;
                return newPlacesAndScreens;
              });
              setSelectedPlaces(newSet);
            }}
          />
        </Container>
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

export default StationSelectPage;
