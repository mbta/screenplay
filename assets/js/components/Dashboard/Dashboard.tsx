import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import PlacesActionBar from "./PlacesActionBar";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import STATION_ORDER_BY_LINE from "../../constants/stationOrder";
import Sidebar from "./Sidebar";
import {
  MODES_AND_LINES,
  SORT_LABELS_BY_LINE,
  SCREEN_TYPES,
  STATUSES,
} from "../../constants/constants";

type DirectionID = 0 | 1;

const getSortLabel = (
  modeLineFilterValue: { label: string },
  sortDirection: DirectionID
) => {
  const line = modeLineFilterValue.label.split(" ")[0];
  const sortLabels = SORT_LABELS_BY_LINE[line];

  if (sortLabels) {
    return sortLabels[sortDirection];
  } else {
    return ["ABC", "ZYX"][sortDirection];
  }
};

const Dashboard = (props: { page: string }): JSX.Element => {
  const [places, setPlaces] = useState<Place[]>([]);
  // ascending/southbound/westbound = 0, descending/northbound/eastbound = 1
  const [sortDirection, setSortDirection] = useState<DirectionID>(0);
  const [modeLineFilterValue, setModeLineFilterValue] = useState(
    MODES_AND_LINES[0]
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] = useState(
    SCREEN_TYPES[0]
  );
  const [showScreenlessPlaces, setShowScreenlessPlaces] = useState(true);
  const [statusFilterValue, setStatusFilterValue] = useState(STATUSES[0]);
  const [activeEventKeys, setActiveEventKeys] = useState<string[]>([]);

  const resetFilters = () => {
    setModeLineFilterValue(MODES_AND_LINES[0]);
    setScreenTypeFilterValue(SCREEN_TYPES[0]);
    setStatusFilterValue(STATUSES[0]);
    setShowScreenlessPlaces(true);
  };

  const goToHome = () => {
    // This approach is difficult to maintain--every time we add new state values,
    // we need to remember to add a line here to "reset" it.
    // TODO: Should the home button simply be a link to /dashboard? That would reload the page,
    // ensuring we start with fresh state.
    setSortDirection(0);
    setActiveEventKeys([]);
    resetFilters();
  };

  const sortLabel = getSortLabel(modeLineFilterValue, sortDirection);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(placeList);
      });
  }, []);

  useEffect(() => {
    setActiveEventKeys([]);
  }, [modeLineFilterValue, screenTypeFilterValue, statusFilterValue]);

  const handleModeOrLineSelect = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter && selectedFilter.label !== modeLineFilterValue.label) {
      setModeLineFilterValue(selectedFilter);
      setSortDirection(0);
    }
  };

  const handleScreenTypeSelect = (value: string) => {
    const selectedFilter = SCREEN_TYPES.find(({ label }) => label === value);
    if (selectedFilter) {
      setScreenTypeFilterValue(selectedFilter);
    }
  };

  const handleStatusSelect = (value: string) => {
    const selectedFilter = STATUSES.find(({ label }) => label === value);
    if (selectedFilter) {
      setStatusFilterValue(selectedFilter);
    }
  };

  const sortLabelOnClick = () => {
    setSortDirection((1 - sortDirection) as DirectionID);
  };

  const sortPlaces = (places: Place[]) => {
    if (["ABC", "ZYX"].includes(sortLabel)) {
      return sortDirection === 0
        ? places.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        : places.sort((a: Place, b: Place) => (a.name < b.name ? 1 : -1));
    } else if (
      // This catches on Silver Line, which we haven't really discussed how it should be treated.
      // Right now, the places list for SL is empty because its screens are all getting listed as buses.
      // It should probably treated as a bus route, but still a question for Adam.
      modeLineFilterValue.label.includes("Line")
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
    if (modeLineFilterValue.label.includes("Line")) {
      return modeLineFilterValue.label === "Green Line"
        ? "Green"
        : modeLineFilterValue.ids[0];
    }

    return "";
  };

  const handleAccordionClick = (eventKey: string) => {
    if (activeEventKeys.includes(eventKey)) {
      setActiveEventKeys(activeEventKeys.filter((e) => e !== eventKey));
    } else {
      setActiveEventKeys([...activeEventKeys, eventKey]);
    }
  };

  const handleClickToggleScreenlessPlaces = () => {
    setShowScreenlessPlaces((prevValue) => !prevValue);
  };

  let header, content;

  switch (props.page) {
    case "alerts":
      header = "Posted Alerts";
      content = (
        <div style={{ color: "white" }}>This will be posted alerts</div>
      );
      break;
    case "overrides":
      header = "Overrides";
      content = null;
      break;
    default:
      const { filteredPlaces, filteredPlacesHaveScreenlessPlaces } =
        filterPlaces();
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

      header = "Places";
      content = (
        <Container fluid>
          <div className="place-list__header-row">
            <div
              className="place-list__sort-label d-flex align-items-center"
              onClick={sortLabelOnClick}
              data-testid="sort-label"
            >
              {sortLabel} {sortDirection === 0 ? <ArrowDown /> : <ArrowUp />}
            </div>
            <FilterDropdown
              list={MODES_AND_LINES}
              onSelect={(value: any) => handleModeOrLineSelect(value)}
              selectedValue={modeLineFilterValue}
            />
            <FilterDropdown
              list={SCREEN_TYPES}
              onSelect={(value: any) => handleScreenTypeSelect(value)}
              selectedValue={screenTypeFilterValue}
            />
            <FilterDropdown
              list={STATUSES}
              onSelect={(value: any) => handleStatusSelect(value)}
              selectedValue={statusFilterValue}
            />
          </div>
          {isFiltered && (
            <PlacesActionBar
              places={sortedFilteredPlaces}
              hasScreenlessPlaces={filteredPlacesHaveScreenlessPlaces}
              showScreenlessPlaces={showScreenlessPlaces}
              onClickResetFilters={resetFilters}
              onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
            />
          )}
          <Accordion flush alwaysOpen activeKey={activeEventKeys}>
            {sortedFilteredPlaces.map((place: Place) => (
              <PlaceRow
                key={place.id}
                place={place}
                eventKey={place.id}
                onClick={handleAccordionClick}
                isFiltered={isFiltered}
                filteredLine={isOnlyFilteredByRoute ? getFilteredLine() : null}
                defaultSort={sortDirection === 0}
              />
            ))}
          </Accordion>
        </Container>
      );
  }

  return (
    <div className="screenplay-container">
      <Sidebar goToHome={goToHome} />
      <div className="page-content">
        <div className="page-content__header">{header}</div>
        <div className="page-content__body">{content}</div>
      </div>
    </div>
  );
};

export default Dashboard;
