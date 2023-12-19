import React, { ComponentType, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AppBar from "./AppBar";
import ButtonImage from "./ButtonImage";
import "../../../../css/screenplay.scss";
import { Place } from "../../../models/place";
import { useScreenplayContext } from "../../../hooks/useScreenplayContext";
import GlEinkWorkflow from "./Workflows/GlEink/GlEinkWorkflow";

const ConfigureScreensPage: ComponentType = () => {
  const [selectedScreenType, setSelectedScreenType] = useState<string>();
  const { places } = useScreenplayContext();

  const getPlacesList = (screenType: string) => {
    let filteredPlaces: Place[] = [];
    switch (screenType) {
      case "gl-eink":
        filteredPlaces = places.filter((place) =>
          place.routes.some((route) => route.startsWith("Green"))
        );
        break;
      default:
        throw new Error(
          `getPlacesList not implemented for screen type ${screenType}`
        );
    }

    return filteredPlaces;
  };

  const selectScreenType = (screenType: string) =>
    setSelectedScreenType(screenType);

  let layout;
  switch (selectedScreenType) {
    case "gl-eink":
      layout = <GlEinkWorkflow places={getPlacesList("gl-eink")} />;
      break;
    default:
      layout = (
        <SelectScreenTypeComponent selectScreenType={selectScreenType} />
      );
  }

  return (
    <div className="configure-screens-page">
      <AppBar title="Configure Screens" />
      {layout}
    </div>
  );
};

interface SelectScreenTypeComponentProps {
  selectScreenType: (screenType: string) => void;
}

const SelectScreenTypeComponent: ComponentType<SelectScreenTypeComponentProps> =
  (props: SelectScreenTypeComponentProps) => {
    const { selectScreenType } = props;

    return (
      <Container className="select-screen-type p-5">
        <Row>
          <Col>
            <div className="h3 select-screen-type__title">
              Select screen type
            </div>
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

interface WorkflowProps {
  places: Place[];
}

export { WorkflowProps };
export default ConfigureScreensPage;
