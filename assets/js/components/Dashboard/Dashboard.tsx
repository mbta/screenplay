import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container } from "react-bootstrap";
import { ArrowDown } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import STATION_ORDER_BY_LINE from "../../constants/stationOrder";
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
  const [activeEventKeys, setActiveEventKeys] = useState<string[]>([]);
  const [sortLabel, setSortLabel] = useState("ABC");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(
          placeList.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        );
      });
  }, []);

  useEffect(() => {
    setActiveEventKeys([]);
  }, [modeLineFilterValue, screenTypeFilterValue, statusFilterValue]);

  const handleModeOrLineSelect = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter) {
      const line = selectedFilter.label.split(" ")[0];
      let sortLabel = "ABC";
      if (line === "Green" || line === "Blue") {
        sortLabel = "WESTBOUND";
      } else if (line === "Red" || line === "Orange") {
        sortLabel = "SOUTHBOUND";
      }
      setSortLabel(sortLabel);
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

    if (modeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredPlaces = filteredPlaces.filter((place) => {
        return place.routes.some((route) =>
          modeLineFilterValue.ids.includes(route)
        );
      });

      // This catches on Silver Line, which we haven't really discussed how it should be treated.
      // Right now, the places list for SL is empty because its screens are all getting listed as buses.
      // It should probably treated as a bus route, but still a question for Adam.
      if (modeLineFilterValue.label.includes("Line")) {
        sortByStationOrder(filteredPlaces, modeLineFilterValue);
      }
    }
    // Can add additional filtering in if statements here.

    return filteredPlaces;
  };

  const sortByStationOrder = (places: Place[], filter: { label: string }) => {
    const line = filter.label.split(" ")[0];
    const stationOrder = STATION_ORDER_BY_LINE[line.toLowerCase()];

    places.sort((placeA, placeB) => {
      const indexA = stationOrder.findIndex((station) => {
        return station.name.toLowerCase() === placeA.name.toLowerCase();
      });
      const indexB = stationOrder.findIndex((station) => {
        return station.name.toLowerCase() === placeB.name.toLowerCase();
      });
      return indexA - indexB;
    });
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
              {sortLabel} <ArrowDown />
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
          <Accordion flush alwaysOpen activeKey={activeEventKeys}>
            {filterPlaces().map((place: Place, index) => (
              <PlaceRow
                key={place.id}
                place={place}
                eventKey={index.toString()}
                handleClick={() => {
                  const i = index.toString();
                  if (activeEventKeys.includes(i)) {
                    setActiveEventKeys(
                      activeEventKeys.filter((eventKey) => eventKey !== i)
                    );
                  } else {
                    setActiveEventKeys([...activeEventKeys, i]);
                  }
                }}
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
