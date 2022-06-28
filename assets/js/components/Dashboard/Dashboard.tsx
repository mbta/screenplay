import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import Sidebar from "./Sidebar";

const modesAndLines = [
  { label: "All MODES", ids: ["All"] },
  { label: "Red Line", ids: ["Red"] },
  { label: "Orange Line", ids: ["Orange"] },
  { label: "Green Line B C D E", ids: ["Green"] },
  { label: "Green Line B", ids: ["Green-B"] },
  { label: "Green Line C", ids: ["Green-C"] },
  { label: "Green Line D", ids: ["Green-D"] },
  { label: "Green Line E", ids: ["Green-E"] },
  { label: "Blue Line", ids: ["Blue"] },
  { label: "Silver Line", ids: ["Silver"] },
  { label: "Bus", ids: ["Bus"] },
  { label: "Commuter Rail", ids: ["CR"] },
  { label: "Ferry", ids: ["Ferry"] },
  { label: "Access", ids: ["Access"] },
];

const screenTypes = [
  { label: "All SCREEN TYPES", ids: ["All"] },
  { label: "Bus Shelter", ids: ["bus_shelter_v2"] },
  { label: "DUP", ids: ["dup"] },
  { label: "E-Ink: Bus", ids: ["bus_eink", "bus_eink_v2"] },
  {
    label: "E-Ink: Green Line",
    ids: ["gl_eink_single", "gl_eink_double", "gl_eink_v2"],
  },
  { label: "Elevator", ids: ["elevator"] },
  { label: "Outfront Media", ids: ["ofm"] },
  { label: "PA/ESS", ids: ["pa_ess"] },
  { label: "Pre Fare Duo", ids: ["pre_fare_v2"] },
  { label: "Solari", ids: ["solari"] },
];

const statuses = [
  { label: "Any STATUS", ids: ["Any"] },
  { label: "Auto", ids: ["Auto"] },
  { label: "Headway mode", ids: ["Headway"] },
  { label: "Overrides", ids: ["Overrides"] },
  { label: "Emergency takeovers", ids: ["Takeovers"] },
  { label: "Errors", ids: ["Errors"] },
  { label: "Screen off", ids: ["Off"] },
];

const Dashboard = (props: { page: string }): JSX.Element => {
  const [places, setPlaces] = useState<Place[]>([]);
  // ascending = true, descending = false
  const [sortDirection, setSortDirection] = useState(true);
  const [modeLineFilterValue, setModeLineFilterValue] = useState(
    modesAndLines[0]
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] = useState(
    screenTypes[0]
  );
  const [statusFilterValue, setStatusFilterValue] = useState(statuses[0]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(placeList);
      });
  }, []);

  const handleModeOrLineSelect = (value: string) => {
    const selectedFilter = modesAndLines.find(({ label }) => label === value);
    if (selectedFilter) {
      setModeLineFilterValue(selectedFilter);
    }
  };

  const handleScreenTypeSelect = (value: string) => {
    const selectedFilter = screenTypes.find(({ label }) => label === value);
    if (selectedFilter) {
      setScreenTypeFilterValue(selectedFilter);
    }
  };

  const handleStatusSelect = (value: string) => {
    const selectedFilter = statuses.find(({ label }) => label === value);
    if (selectedFilter) {
      setStatusFilterValue(selectedFilter);
    }
  };

  const sortPlaces = (places: Place[]) => {
    if (
      modeLineFilterValue === modesAndLines[0] ||
      statusFilterValue !== statuses[0] ||
      screenTypeFilterValue !== screenTypes[0]
    ) {
      return sortDirection
        ? places.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        : places.sort((a: Place, b: Place) => (a.name < b.name ? 1 : -1));
    }
    // Sorting for mode/line filter

    return places;
  };

  const filterPlaces = () => {
    let filteredPlaces = places;
    if (screenTypeFilterValue !== screenTypes[0]) {
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
    setModeLineFilterValue(modesAndLines[0]);
    setScreenTypeFilterValue(screenTypes[0]);
    setStatusFilterValue(statuses[0]);
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
            <div
              className="place-list__sort-label d-flex align-items-center"
              onClick={() => setSortDirection(!sortDirection)}
            >
              ABC {sortDirection ? <ArrowDown /> : <ArrowUp />}
            </div>
            <FilterDropdown
              list={modesAndLines}
              onSelect={(value: any) => handleModeOrLineSelect(value)}
              selectedValue={modeLineFilterValue}
            />
            <FilterDropdown
              list={screenTypes}
              onSelect={(value: any) => handleScreenTypeSelect(value)}
              selectedValue={screenTypeFilterValue}
            />
            <FilterDropdown
              list={statuses}
              onSelect={(value: any) => handleStatusSelect(value)}
              selectedValue={statusFilterValue}
            />
          </div>
          <Accordion flush alwaysOpen>
            {sortPlaces(filterPlaces()).map((place: Place, index) => (
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
