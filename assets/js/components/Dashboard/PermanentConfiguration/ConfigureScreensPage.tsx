import React, { ComponentType } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Appbar from "./AppBar";
import ButtonImage from "./ButtonImage";
import "../../../../css/screenplay.scss";

const ConfigureScreensPage: ComponentType = () => {
  return (
    <div className="configure-screens-page">
      <Appbar title="Configure Screens" />
      <Container className="select-screen-type p-5">
        <Row>
          <Col>
            <div className="select-screen-type__title">Select screen type</div>
          </Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>
            <ButtonImage fileName="bus-eink.png" label="Bus E-Ink" />
          </Col>
          <Col>
            <ButtonImage fileName="bus-shelter.png" label="Bus Shelter" />
          </Col>
          <Col>
            <ButtonImage fileName="gl-eink.png" label="Green Line E-Ink" />
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonImage fileName="dup.png" label="DUP" />
          </Col>
          <Col>
            <ButtonImage fileName="pre-fare.png" label="Pre Fare" />
          </Col>
          <Col>
            <ButtonImage fileName="solari.png" label="Solari" />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ConfigureScreensPage;
