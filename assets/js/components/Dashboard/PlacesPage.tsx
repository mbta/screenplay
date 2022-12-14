import React, { ComponentType } from "react";
import PlaceRow from "./PlaceRow";
import PlacesActionBar from "./PlacesActionBar";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Col, Container, Row } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import { Place } from "../../models/place";
import STATION_ORDER_BY_LINE from "../../constants/stationOrder";
import {
  MODES_AND_LINES,
  SORT_LABELS,
  SCREEN_TYPES,
  STATUSES,
} from "../../constants/constants";
import {
  usePlacesPageContext,
  usePlacesPageDispatchContext,
  useScreenplayContext,
} from "../../hooks/useScreenplayContext";
import { usePrevious } from "../../hooks/usePrevious";

type DirectionID = 0 | 1;

const getSortLabel = (
  modeLineFilterValue: { label: string },
  sortDirection: DirectionID
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
  const { places } = useScreenplayContext();

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
  } = usePlacesPageContext();
  const dispatch = usePlacesPageDispatchContext();
  const prevPlaceIds = usePrevious(places)?.map((place) => place.id) ?? [];

  const handleClickResetFilters = () => {
    dispatch({ type: "RESET_STATE", page: "PLACES" });
  };

  const sortLabel = getSortLabel(modeLineFilterValue, sortDirection);

  const handleSelectModeOrLine = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter && selectedFilter.label !== modeLineFilterValue.label) {
      dispatch({
        type: "SET_MODE_LINE_FILTER",
        page: "PLACES",
        filterValue: selectedFilter,
      });
      dispatch({
        type: "SET_SORT_DIRECTION",
        page: "PLACES",
        sortDirection: 0,
      });
    }
  };

  const handleSelectScreenType = (value: string) => {
    const selectedFilter = SCREEN_TYPES.find(({ label }) => label === value);
    if (selectedFilter) {
      dispatch({
        type: "SET_SCREEN_TYPE_FILTER",
        page: "PLACES",
        filterValue: selectedFilter,
      });
    }
  };

  const handleSelectStatus = (value: string) => {
    const selectedFilter = STATUSES.find(({ label }) => label === value);
    if (selectedFilter) {
      dispatch({
        type: "SET_STATUS_FILTER",
        page: "PLACES",
        filterValue: selectedFilter,
      });
    }
  };

  const handleClickSortLabel = () => {
    dispatch({
      type: "SET_SORT_DIRECTION",
      page: "PLACES",
      sortDirection: 1 - sortDirection,
    });
  };

  const sortPlaces = (places: Place[]) => {
    if (["ABC", "ZYX"].includes(sortLabel)) {
      return sortDirection === 0
        ? places.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        : places.sort((a: Place, b: Place) => (a.name < b.name ? 1 : -1));
    } else if (
      modeLineFilterValue.label.includes("Line") ||
      modeLineFilterValue.label === "Mattapan"
    ) {
      return sortByStationOrder(places, sortDirection === 1);
    }

    return places;
  };

  const filterPlaces = () => {
    let filteredPlaces = places;
    if (screenTypeFilterValue !== SCREEN_TYPES[0]) {
      filteredPlaces = filteredPlaces.filter((place) => {
        return place.screens.some((screen) =>
          screenTypeFilterValue.ids.includes(screen.type)
        );
      });
    }

    if (modeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredPlaces = filteredPlaces.filter((place) => {
        return place.routes.some((route) =>
          modeLineFilterValue.ids.includes(route)
        );
      });
    }

    const filteredPlacesHaveScreenlessPlaces = filteredPlaces.some(
      (place) => place.screens.length === 0
    );

    if (!showScreenlessPlaces) {
      filteredPlaces = filteredPlaces.filter(
        (place) => place.screens.length > 0
      );
    }
    // Can add additional filtering in if statements here.

    return { filteredPlaces, filteredPlacesHaveScreenlessPlaces };
  };

  const sortByStationOrder = (places: Place[], reverse?: boolean) => {
    const stationOrder = STATION_ORDER_BY_LINE[getFilteredLine().toLowerCase()];

    places.sort((placeA, placeB) => {
      const indexA = stationOrder.findIndex((station) => {
        return station.name.toLowerCase() === placeA.name.toLowerCase();
      });
      const indexB = stationOrder.findIndex((station) => {
        return station.name.toLowerCase() === placeB.name.toLowerCase();
      });
      return indexA - indexB;
    });

    return reverse ? places.reverse() : places;
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

  const handleClickAccordion = (eventKey: string) => {
    if (activeEventKeys.includes(eventKey)) {
      dispatch({
        type: "SET_ACTIVE_EVENT_KEYS",
        page: "PLACES",
        eventKeys: activeEventKeys.filter((e) => e !== eventKey),
      });
    } else {
      dispatch({
        type: "SET_ACTIVE_EVENT_KEYS",
        page: "PLACES",
        eventKeys: [...activeEventKeys, eventKey],
      });
    }
  };

  const handleClickToggleScreenlessPlaces = () => {
    dispatch({
      type: "SET_SHOW_SCREENLESS_PLACES",
      page: "PLACES",
      show: !showScreenlessPlaces,
    });
  };

  const { filteredPlaces, filteredPlacesHaveScreenlessPlaces } = filterPlaces();
  const sortedFilteredPlaces = sortPlaces(filteredPlaces);

  const isFiltered =
    modeLineFilterValue !== MODES_AND_LINES[0] ||
    statusFilterValue !== STATUSES[0] ||
    screenTypeFilterValue !== SCREEN_TYPES[0];

  const isOnlyFilteredByRoute =
    modeLineFilterValue !== MODES_AND_LINES[0] &&
    statusFilterValue === STATUSES[0] &&
    screenTypeFilterValue === SCREEN_TYPES[0] &&
    (showScreenlessPlaces || !filteredPlacesHaveScreenlessPlaces);

  return (
    <>
      <Container fluid>
        <Row className="filterable-list__header-row">
          <Col lg={3}>
            <div
              className="filterable-list__sort-label d-flex align-items-center"
              onClick={handleClickSortLabel}
              data-testid="sort-label"
            >
              {sortLabel} {sortDirection === 0 ? <ArrowDown /> : <ArrowUp />}
            </div>
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
          showScreenlessPlaces={showScreenlessPlaces}
          onClickResetFilters={handleClickResetFilters}
          onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
          // Only show reset filters if NOT isAlertPlacesList, OR if isAlertPlacesList and isFiltered
          hideResetFiltersButton={isAlertPlacesList && !isFiltered}
        />
      )}
      <Accordion flush alwaysOpen activeKey={activeEventKeys}>
        {sortedFilteredPlaces.map((place: Place) => {
          return (
            <PlaceRow
              key={place.id}
              place={place}
              eventKey={place.id}
              onClick={handleClickAccordion}
              classNames={isFiltered || isAlertPlacesList ? "filtered" : ""}
              filteredLine={isOnlyFilteredByRoute ? getFilteredLine() : null}
              defaultSort={sortDirection === 0}
              showAnimation={
                showAnimationForNewPlaces && !prevPlaceIds.includes(place.id)
              }
            />
          );
        })}
      </Accordion>
    </>
  );
};

export default PlacesPage;
export { PlacesList };
