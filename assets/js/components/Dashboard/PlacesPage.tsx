import React, { ComponentType } from "react";
import PlacesActionBar from "Components/PlacesActionBar";
import FilterDropdown from "Components/FilterDropdown";
import PlaceRowAccordion from "Components/PlaceRowAccordion";
import SortLabel from "Components/SortLabel";
import { Accordion, Col, Container, Row } from "react-bootstrap";
import { Place } from "Models/place";
import {
  PLACES_PAGE_MODES_AND_LINES as MODES_AND_LINES,
  SORT_LABELS,
  SCREEN_TYPES,
  STATUSES,
} from "Constants/constants";
import {
  usePlacesListState,
  useScreenplayState,
} from "Hooks/useScreenplayContext";
import { DirectionID } from "Models/direction_id";
import { usePrevious } from "Hooks/usePrevious";
import { sortByStationOrder } from "../../util";

const getSortLabel = (
  modeLineFilterValue: { label: string },
  sortDirection: DirectionID,
) => {
  const line = modeLineFilterValue.label.split(" ")[0];
  const sortLabels = SORT_LABELS[line];

  if (sortLabels) {
    return sortLabels[sortDirection];
  } else {
    return ["ABC", "ZYX"][sortDirection];
  }
};

const PlacesPage: ComponentType = () => {
  const { places } = useScreenplayState();

  return (
    <div className="places-page">
      <div className="page-content__header">Places</div>
      <div className="page-content__body">
        <PlacesList places={places} />
      </div>
    </div>
  );
};

interface PlacesListProps {
  places: Place[];
  noModeFilter?: boolean;
  isAlertPlacesList?: boolean;
  showAnimationForNewPlaces?: boolean;
}

const PlacesList: ComponentType<PlacesListProps> = ({
  places,
  noModeFilter,
  isAlertPlacesList,
  showAnimationForNewPlaces,
}: PlacesListProps) => {
  // ascending/southbound/westbound = 0, descending/northbound/eastbound = 1
  const {
    sortDirection,
    modeLineFilterValue,
    screenTypeFilterValue,
    statusFilterValue,
    showScreenlessPlaces,
    activeEventKeys,
    resetState,
    setModeLineFilterValue,
    setScreenTypeFilterValue,
    setStatusFilterValue,
    setSortDirection,
    setShowScreenlessPlaces,
  } = usePlacesListState();
  const prevPlaceIds = usePrevious(places)?.map((place) => place.id);

  const handleSelectModeOrLine = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter && selectedFilter.label !== modeLineFilterValue.label) {
      setModeLineFilterValue(selectedFilter);
    }
  };

  const handleSelectScreenType = (value: string) => {
    const selectedFilter = SCREEN_TYPES.find(({ label }) => label === value);
    if (selectedFilter) {
      setScreenTypeFilterValue(selectedFilter);
    }
  };

  const handleSelectStatus = (value: string) => {
    const selectedFilter = STATUSES.find(({ label }) => label === value);
    if (selectedFilter) {
      setStatusFilterValue(selectedFilter);
    }
  };

  const handleClickSortLabel = () => {
    setSortDirection(sortDirection === 0 ? 1 : 0);
  };

  const sortLabel = getSortLabel(modeLineFilterValue, sortDirection);

  const sortPlaces = (places: Place[]) => {
    if (["ABC", "ZYX"].includes(sortLabel)) {
      return sortDirection === 0
        ? places.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        : places.sort((a: Place, b: Place) => (a.name < b.name ? 1 : -1));
    } else if (
      modeLineFilterValue.label.includes("Line") ||
      modeLineFilterValue.label === "Mattapan"
    ) {
      return sortByStationOrder(places, getFilteredLine(), sortDirection === 1);
    }

    return places;
  };

  const filterPlaces = () => {
    let filteredPlaces = places;
    if (screenTypeFilterValue !== SCREEN_TYPES[0]) {
      filteredPlaces = filteredPlaces.filter((place) => {
        return place.screens.some((screen) =>
          screenTypeFilterValue.ids.includes(screen.type),
        );
      });
    }

    if (modeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredPlaces = filteredPlaces.filter((place) => {
        return place.routes.some((route) =>
          modeLineFilterValue.ids.includes(route),
        );
      });
    }

    const filteredPlacesHaveScreenlessPlaces = filteredPlaces.some(
      (place) => place.screens.length === 0,
    );

    if (!showScreenlessPlaces) {
      filteredPlaces = filteredPlaces.filter(
        (place) => place.screens.length > 0,
      );
    }
    // Can add additional filtering in if statements here.

    return { filteredPlaces, filteredPlacesHaveScreenlessPlaces };
  };

  const getFilteredLine = () => {
    if (
      modeLineFilterValue.label.includes("Line") ||
      modeLineFilterValue.label === "Mattapan"
    ) {
      return modeLineFilterValue.label === "Green Line"
        ? "Green"
        : modeLineFilterValue.ids[0];
    }

    return "";
  };

  const handleClickToggleScreenlessPlaces = () => {
    setShowScreenlessPlaces(!showScreenlessPlaces);
  };

  const { filteredPlaces, filteredPlacesHaveScreenlessPlaces } = filterPlaces();
  const sortedFilteredPlaces = sortPlaces(filteredPlaces);

  const isFiltered =
    modeLineFilterValue !== MODES_AND_LINES[0] ||
    statusFilterValue !== STATUSES[0] ||
    screenTypeFilterValue !== SCREEN_TYPES[0];

  return (
    <>
      <Container fluid>
        <Row className="filterable-list__header-row">
          <Col lg={3}>
            <SortLabel
              label={sortLabel}
              sortDirection={sortDirection}
              onClick={handleClickSortLabel}
            />
          </Col>
          <Col lg={3} className="d-flex justify-content-end pe-3">
            {!noModeFilter && (
              <FilterDropdown
                list={MODES_AND_LINES}
                onSelect={(value: any) => handleSelectModeOrLine(value)}
                selectedValue={modeLineFilterValue}
                className="modes-and-lines"
              />
            )}
          </Col>
          <Col lg={3} className="place-screen-types pe-3">
            <FilterDropdown
              list={SCREEN_TYPES}
              onSelect={(value: any) => handleSelectScreenType(value)}
              selectedValue={screenTypeFilterValue}
              className="screen-types"
            />
          </Col>
          <Col lg={3}>
            <FilterDropdown
              list={STATUSES}
              onSelect={(value: any) => handleSelectStatus(value)}
              selectedValue={statusFilterValue}
              className="statuses"
              disabled
            />
          </Col>
        </Row>
      </Container>
      {(isFiltered || isAlertPlacesList) && (
        <PlacesActionBar
          places={sortedFilteredPlaces}
          hasScreenlessPlaces={filteredPlacesHaveScreenlessPlaces}
          showScreenlessPlaces={showScreenlessPlaces ?? false}
          onClickResetFilters={resetState}
          onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
          // Only show reset filters if NOT isAlertPlacesList, OR if isAlertPlacesList and isFiltered
          hideResetFiltersButton={isAlertPlacesList && !isFiltered}
        />
      )}
      <Accordion flush alwaysOpen activeKey={activeEventKeys}>
        {sortedFilteredPlaces.map((place: Place) => {
          const isOnlyFilteredByRoute =
            modeLineFilterValue !== MODES_AND_LINES[0] &&
            statusFilterValue === STATUSES[0] &&
            screenTypeFilterValue === SCREEN_TYPES[0] &&
            (showScreenlessPlaces || !filteredPlacesHaveScreenlessPlaces);

          return (
            <PlaceRowAccordion
              key={place.id}
              place={place}
              canShowAnimation={
                showAnimationForNewPlaces &&
                prevPlaceIds !== undefined &&
                !prevPlaceIds.includes(place.id)
              }
              activeEventKeys={activeEventKeys}
              sortDirection={sortDirection}
              filteredLine={isOnlyFilteredByRoute ? getFilteredLine() : null}
              className={isFiltered || isAlertPlacesList ? "filtered" : ""}
            />
          );
        })}
      </Accordion>
    </>
  );
};

export default PlacesPage;
export { PlacesList };
