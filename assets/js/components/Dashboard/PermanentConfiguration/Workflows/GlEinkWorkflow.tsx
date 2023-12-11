import React, { ComponentType, useState } from "react";
import { WorkflowProps } from "../ConfigureScreensPage";
import { Container } from "react-bootstrap";
import PlaceRow from "../../PlaceRow";
import PlacesSearchBar, { SearchItem } from "../PlacesSearchBar";
import { sortByStationOrder } from "../../../../util";
import SortLabel from "../../SortLabel";
import { SORT_LABELS } from "../../../../constants/constants";
import { DirectionID } from "../../../../models/direction_id";
import BottomActionBar from "../BottomActionBar";
import { useNavigate } from "react-router-dom";

const GlEinkWorkflow: ComponentType<WorkflowProps> = ({
  places,
}: WorkflowProps) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [sortDirection, setSortDirection] = useState<DirectionID>(0);
  const handleSearchResultClick = (place: SearchItem) => {
    const existingSelectedPlaces = new Set(selectedPlaces);
    setSelectedPlaces(existingSelectedPlaces.add(place.id));
  };

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
              selectedItems={Array.from(selectedPlaces)}
              handleSearchResultClick={handleSearchResultClick}
            />
          </div>
          <div className="mt-4">
            <SortLabel
              label={SORT_LABELS["Green"][sortDirection]}
              sortDirection={sortDirection}
              onClick={() =>
                setSortDirection((1 - sortDirection) as DirectionID)
              }
              className="mx-3 mb-4"
            />
            <div className="workflow__places-list-header-row">
              <div className="workflow__places-list-header-text">
                <span className="workflow__places-list-header-count">
                  {selectedPlaces.size}
                </span>{" "}
                stations selected
              </div>
            </div>
            {sortByStationOrder(places, "Green", sortDirection === 1).map(
              (place) => (
                <PlaceRow
                  key={place.id}
                  place={place}
                  filteredLine="Green"
                  variant="select-box"
                  defaultSort={sortDirection === 0}
                  className="filtered"
                  checked={selectedPlaces.has(place.id)}
                  onClick={(checked: boolean) => {
                    // Make a new Set so React knows state was changed.
                    const newSet = new Set(selectedPlaces);
                    checked ? newSet.add(place.id) : newSet.delete(place.id);

                    setSelectedPlaces(newSet);
                  }}
                />
              )
            )}
          </div>
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

export default GlEinkWorkflow;
