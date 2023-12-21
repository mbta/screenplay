import React, { ComponentType, useState } from "react";
import { Container } from "react-bootstrap";
import PlacesSearchBar, { SearchItem } from "../../PlacesSearchBar";
import WorkflowPlacesList from "../../WorkflowPlacesList";
import { Place } from "../../../../../models/place";
import { DirectionID } from "../../../../../models/direction_id";

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

export default StationSelectPage;