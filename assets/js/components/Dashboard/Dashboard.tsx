import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import FilterDropdown from "./FilterDropdown";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import { ArrowDown } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";

const modesAndLines = [
  "All MODES",
  "Red Line",
  "Orange Line",
  "Green Line B C D E",
  "Green Line B",
  "Green Line C",
  "Green Line D",
  "Green Line E",
  "Blue Line",
  "Silver Line",
  "Bus",
  "Commuter Rail",
  "Ferry",
  "Access",
];

const screenTypes = [
  "All SCREEN TYPES",
  "Bus Shelter",
  "DUP",
  "E-Ink: Bus",
  "E-Ink: Green Line",
  "Elevator",
  "Outfront Media",
  "PA/ESS",
  "Pre Fare Duo",
  "Solari",
];

const statuses = [
  "Any STATUS",
  "Auto",
  "Headway mode",
  "Overrides",
  "Emergency takeovers",
  "Errors",
  "Screen off",
];

const Dashboard = (): JSX.Element => {
  const [places, setPlaces] = useState([]);
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
    setModeLineFilterValue(value);
  };

  const handleScreenTypeSelect = (value: string) => {
    setScreenTypeFilterValue(value);
  };

  const handleStatusSelect = (value: string) => {
    setStatusFilterValue(value);
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
              <Col className="place-list__sort-label" lg={4}>
                ABC <ArrowDown />
              </Col>
              <Col
                className="place-list__mode-line-filter d-flex justify-content-end pe-5"
                lg={2}
              >
                <FilterDropdown
                  list={modesAndLines}
                  onSelect={(value: any) => handleModeOrLineSelect(value)}
                  modeLineFilterValue={modeLineFilterValue}
                />
              </Col>
              <Col className="place-list__screen-type-filter pe-5" lg={3}>
                <FilterDropdown
                  list={screenTypes}
                  onSelect={(value: any) => handleScreenTypeSelect(value)}
                  modeLineFilterValue={screenTypeFilterValue}
                />
              </Col>
              <Col className="place-list__status-filter" lg={2}>
                <FilterDropdown
                  list={statuses}
                  onSelect={(value: any) => handleStatusSelect(value)}
                  modeLineFilterValue={statusFilterValue}
                />
              </Col>
            </Row>
            <Accordion flush alwaysOpen>
              {places.map((place: Place, index) => (
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
