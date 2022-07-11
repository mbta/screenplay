import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container } from "react-bootstrap";
import { ArrowDown } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import Sidebar from "./Sidebar";
import {
  MODES_AND_LINES,
  SCREEN_TYPES,
  STATUSES,
} from "../../constants/constants";

const Dashboard = (props: { page: string }): JSX.Element => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [modeLineFilterValue, setModeLineFilterValue] = useState(
    MODES_AND_LINES[0]
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] = useState(
    SCREEN_TYPES[0]
  );
  const [statusFilterValue, setStatusFilterValue] = useState(STATUSES[0]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(
          placeList.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        );
      });
  }, []);

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

  const filterPlaces = () => {
    let filteredPlaces = places;
    if (screenTypeFilterValue !== SCREEN_TYPES[0]) {
      filteredPlaces = places.filter((place) => {
        return place.screens.some((screen) =>
          screenTypeFilterValue.ids.includes(screen.type)
        );
      });
    }
    // Can add additional filtering in if statements here.

    return filteredPlaces;
  };

  const goToHome = () => {
    setModeLineFilterValue(MODES_AND_LINES[0]);
    setScreenTypeFilterValue(SCREEN_TYPES[0]);
    setStatusFilterValue(STATUSES[0]);
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
        <Container fluid>
          <div className="place-list__header-row">
            <div className="place-list__sort-label d-flex align-items-center">
              ABC <ArrowDown />
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
          <Accordion flush alwaysOpen>
            {filterPlaces().map((place: Place, index) => (
              <PlaceRow
                key={place.id}
                place={place}
                eventKey={index.toString()}
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
