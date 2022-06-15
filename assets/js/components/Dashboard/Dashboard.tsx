import React, { useEffect, useState } from "react";
import PlaceRow from "./PlaceRow";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import { Place } from "../../models/place";
import "../../../css/screenplay.scss";

const Dashboard = (): JSX.Element => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(
          placeList.sort((a: Place, b: Place) => (a.name > b.name ? 1 : -1))
        );
      });
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col lg={1} style={{ background: "black" }}></Col>
        <Col
          lg={11}
          style={{ background: "#171F26", padding: "24px 32px 32px 32px" }}
        >
          <Accordion flush alwaysOpen>
            {places.map((place: Place, index) => (
              <PlaceRow
                key={place.id}
                place={place}
                eventKey={index.toString()}
              />
            ))}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
