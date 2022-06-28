import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import { ArrowDown } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";

const modesAndLines = [
  { label: "All MODES", ids: ["All"] },
  { label: "Red Line", ids: ["Red"], color: "#DA291C" },
  { label: "Orange Line", ids: ["Orange"], color: "#ED8B00" },
  { label: "Green Line B C D E", ids: ["Green-B", "Green-C", "Green-D", "Green-E"], color: "#00843D" },
  { label: "Green Line B", ids: ["Green-B"], color: "#00843D" },
  { label: "Green Line C", ids: ["Green-C"], color: "#00843D" },
  { label: "Green Line D", ids: ["Green-D"], color: "#00843D" },
  { label: "Green Line E", ids: ["Green-E"], color: "#00843D" },
  { label: "Blue Line", ids: ["Blue"], color: "#003DA5" },
  { label: "Silver Line", ids: ["Silver"], color: "#7C878E" },
  { label: "Bus", ids: ["Bus"], color: "#FFC72C" },
  { label: "Commuter Rail", ids: ["CR"], color: "#80276C" },
  { label: "Ferry", ids: ["Ferry"], color: "#008EAA" },
  { label: "Access", ids: ["Access"], color: "#165C96" },
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

const Dashboard = (): JSX.Element => {
  const [places, setPlaces] = useState<Place[]>([]);
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
        setPlaces(
          placeList.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        );
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

  const filterPlaces = () => {
    let filteredPlaces = places;
    if (screenTypeFilterValue !== screenTypes[0]) {
      filteredPlaces = places.filter((place) => {
        return place.screens.some((screen) =>
          screenTypeFilterValue.ids.includes(screen.type)
        );
      });
    }

    if (modeLineFilterValue !== modesAndLines[0]) {
        filteredPlaces = filteredPlaces.filter((place) => {
          return place.routes.some((route) =>
            modeLineFilterValue.ids.includes(route)
          );
        })
        // if it's a route, sort it by stop order
    }
    // Can add additional filtering in if statements here.

    return filteredPlaces;
  };

  return (
    <Container fluid>
      <Row>
        <Col lg={1} style={{ background: "black" }}></Col>
        <Col
          lg={11}
          style={{
            background: "#171F26",
            padding: "24px 32px 32px 32px",
          }}
        >
          <Container fluid>
            <Row className="place-list__header-row d-flex align-items-center">
              <Col
                className="place-list__sort-label d-flex align-items-center"
                lg={4}
              >
                ABC <ArrowDown />
              </Col>
              <Col
                className="place-list__mode-line-filter d-flex justify-content-end pe-5"
                lg={2}
              >
                <FilterDropdown
                  list={modesAndLines}
                  onSelect={(value: any) => handleModeOrLineSelect(value)}
                  selectedValue={modeLineFilterValue}
                />
              </Col>
              <Col className="place-list__screen-type-filter pe-5" lg={3}>
                <FilterDropdown
                  list={screenTypes}
                  onSelect={(value: any) => handleScreenTypeSelect(value)}
                  selectedValue={screenTypeFilterValue}
                />
              </Col>
              <Col className="place-list__status-filter" lg={2}>
                <FilterDropdown
                  list={statuses}
                  onSelect={(value: any) => handleStatusSelect(value)}
                  selectedValue={statusFilterValue}
                />
              </Col>
            </Row>
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
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
