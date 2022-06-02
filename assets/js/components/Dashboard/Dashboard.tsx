import React from "react";
import PlaceRow from "./PlaceRow";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import "../../../css/screenplay.scss";

class Dashboard extends React.Component {
  render() {
    return (
      <Container fluid>
        <Row>
          <Col lg={1} style={{ background: "black" }}></Col>
          <Col
            lg={11}
            style={{ background: "#171F26", padding: "24px 32px 32px 32px" }}
          >
            <Accordion flush>
              <PlaceRow
                name="Place Name"
                modesAndLines={["CR", "RL"]}
                screenTypes={["DUP", "Solari", "OFM", "PA"]}
                status="Auto"
                stopId="place-stop"
                eventKey="0"
              />
              <PlaceRow
                name="Place Name2"
                modesAndLines={["CR", "RL"]}
                screenTypes={["DUP", "Solari", "OFM", "PA"]}
                status="Auto"
                stopId="place-stop"
                eventKey="1"
              />
              <PlaceRow
                name="Place Name3"
                modesAndLines={["RL"]}
                screenTypes={[]}
                status="Auto"
                stopId="place-stop"
                eventKey="2"
              />
            </Accordion>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Dashboard;
