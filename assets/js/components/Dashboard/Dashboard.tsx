import React from "react";
import PlaceRow from "./PlaceRow";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import { Place } from "../../models/place";
import "../../../css/screenplay.scss";

class Dashboard extends React.Component {
  render() {
    const data: Place[] = [
      {
        id: "place-stop1",
        name: "Place Name1",
        modesAndLines: ["CR", "RL"],
        status: "Auto",
        screens: [
          { id: "1111", type: "DUP", disabled: false },
          { id: "2222", type: "Solari", disabled: false },
          { id: "3333", type: "OFM", disabled: false },
          { id: "4444", type: "PA", disabled: false },
        ],
      },
      {
        id: "place-stop2",
        name: "Place Name2",
        modesAndLines: ["CR", "RL"],
        status: "Auto",
        screens: [
          { id: "1111", type: "DUP", disabled: false },
          { id: "2222", type: "Solari", disabled: false },
          { id: "3333", type: "OFM", disabled: false },
          { id: "4444", type: "PA", disabled: false },
        ],
      },
      {
        id: "place-stop3",
        name: "Place Name3",
        modesAndLines: ["CR", "RL"],
        status: "Auto",
        screens: [],
      },
    ];

    return (
      <Container fluid>
        <Row>
          <Col lg={1} style={{ background: "black" }}></Col>
          <Col
            lg={11}
            style={{ background: "#171F26", padding: "24px 32px 32px 32px" }}
          >
            <Accordion flush alwaysOpen>
              {data.map((place, index) => (
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
  }
}

export default Dashboard;
