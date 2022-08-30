import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Col, Container, Row } from "react-bootstrap";
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
  const [statusFilterValue, setStatusFilterValue] = useState(STATUSES[0]);
  const [activeEventKeys, setActiveEventKeys] = useState<string[]>([]);

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
    if (selectedFilter) {
      setModeLineFilterValue(selectedFilter);
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
      filteredPlaces = places.filter((place) => {
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

    return filteredPlaces;
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

  const isOnlyFilteredByRoute = () => {
    return (
      modeLineFilterValue !== MODES_AND_LINES[0] &&
      statusFilterValue === STATUSES[0] &&
      screenTypeFilterValue === SCREEN_TYPES[0]
    );
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

  const goToHome = () => {
    setModeLineFilterValue(MODES_AND_LINES[0]);
    setScreenTypeFilterValue(SCREEN_TYPES[0]);
    setStatusFilterValue(STATUSES[0]);
    setSortDirection(0);
  };

  const handleAccordionClick = (eventKey: string) => {
    if (activeEventKeys.includes(eventKey)) {
      setActiveEventKeys(activeEventKeys.filter((e) => e !== eventKey));
    } else {
      setActiveEventKeys([...activeEventKeys, eventKey]);
    }
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
      header = "Places";
      content = (
        <>
          <Container fluid>
            <Row className="place-list__header-row">
              <Col lg={3}>
                <div
                  className="place-list__sort-label d-flex align-items-center"
                  onClick={sortLabelOnClick}
                  data-testid="sort-label"
                >
                  {sortLabel}{" "}
                  {sortDirection === 0 ? <ArrowDown /> : <ArrowUp />}
                </div>
              </Col>
              <Col lg={3} className="d-flex justify-content-end pe-3">
                <FilterDropdown
                  list={MODES_AND_LINES}
                  onSelect={(value: any) => handleModeOrLineSelect(value)}
                  selectedValue={modeLineFilterValue}
                  className="modes-and-lines"
                />
              </Col>
              <Col lg={3} className="place-screen-types pe-3">
                <FilterDropdown
                  list={SCREEN_TYPES}
                  onSelect={(value: any) => handleScreenTypeSelect(value)}
                  selectedValue={screenTypeFilterValue}
                  className="screen-types"
                />
              </Col>
              <Col lg={3}>
                <FilterDropdown
                  list={STATUSES}
                  onSelect={(value: any) => handleStatusSelect(value)}
                  selectedValue={statusFilterValue}
                  className="statuses"
                  disabled
                />
              </Col>
            </Row>
          </Container>
          <Accordion flush alwaysOpen activeKey={activeEventKeys}>
            {sortPlaces(filterPlaces()).map((place: Place, index) => (
              <PlaceRow
                key={place.id}
                place={place}
                eventKey={index.toString()}
                onClick={handleAccordionClick}
                filteredLine={
                  isOnlyFilteredByRoute() ? getFilteredLine() : null
                }
                defaultSort={sortDirection === 0}
              />
            ))}
          </Accordion>
        </>
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
