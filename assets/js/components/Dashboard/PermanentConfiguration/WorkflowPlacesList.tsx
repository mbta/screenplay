import React, { ComponentType } from "react";
import SortLabel from "Components/SortLabel";
import { SORT_LABELS } from "Constants/constants";
import { DirectionID } from "Models/direction_id";
import { sortByStationOrder } from "../../../util";
import { Place } from "Models/place";
import PlaceRow from "Components/PlaceRow";

interface WorkflowPlacesListProps {
  sortDirection: DirectionID;
  setSortDirection: React.Dispatch<React.SetStateAction<DirectionID>>;
  selectedPlaces: Set<string>;
  places: Place[];
  onRowClick: (place: Place, checked: boolean) => void;
}

const WorkflowPlacesList: ComponentType<WorkflowPlacesListProps> = ({
  sortDirection,
  setSortDirection,
  selectedPlaces,
  places,
  onRowClick,
}: WorkflowPlacesListProps) => {
  return (
    <div className="mt-4">
      <SortLabel
        label={SORT_LABELS["Green"][sortDirection]}
        sortDirection={sortDirection}
        onClick={() =>
          setSortDirection((prevSD) => (1 - prevSD) as DirectionID)
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
      {sortByStationOrder(places, "Green", sortDirection === 1).map((place) => (
        <PlaceRow
          key={place.id}
          place={place}
          filteredLine="Green"
          variant="select-box"
          defaultSort={sortDirection === 0}
          className="filtered"
          checked={selectedPlaces.has(place.id)}
          onClick={(checked: boolean) => onRowClick(place, checked)}
        />
      ))}
    </div>
  );
};

export default WorkflowPlacesList;
