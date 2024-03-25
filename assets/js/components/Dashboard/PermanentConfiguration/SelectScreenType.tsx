import React, { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import ButtonImage from "./ButtonImage";

const SelectScreenTypeComponent: ComponentType = () => {
  const navigate = useNavigate();
  const selectScreenType = (screenType: string) => {
    switch (screenType) {
      case "gl-eink":
        navigate("/configure-screens/gl-eink", { replace: true });
        break;
    }
  };

  return (
    <Container className="select-screen-type p-5">
      <Row>
        <Col>
          <div className="h3 select-screen-type__title">Select screen type</div>
        </Col>
        <Col></Col>
        <Col></Col>
      </Row>
      <Row md={2} lg={3}>
        <Col>
          <ButtonImage
            fileName="bus-eink.png"
            label="Bus E-Ink"
            onClick={() => selectScreenType("bus-eink")}
          />
        </Col>
        <Col>
          <ButtonImage
            fileName="bus-shelter.png"
            label="Bus Shelter"
            onClick={() => selectScreenType("bus-shelter")}
          />
        </Col>
        <Col>
          <ButtonImage
            fileName="gl-eink.png"
            label="Green Line E-Ink"
            onClick={() => selectScreenType("gl-eink")}
          />
        </Col>
        <Col>
          <ButtonImage
            fileName="dup.png"
            label="DUP"
            onClick={() => selectScreenType("dup")}
          />
        </Col>
        <Col>
          <ButtonImage
            fileName="pre-fare.png"
            label="Pre Fare"
            onClick={() => selectScreenType("pre-fare")}
          />
        </Col>
        <Col>
          <ButtonImage
            fileName="solari.png"
            label="Solari"
            onClick={() => selectScreenType("solari")}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SelectScreenTypeComponent;
