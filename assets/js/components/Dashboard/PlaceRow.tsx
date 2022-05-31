import React, { useContext } from "react";
import {
  Accordion,
  Card,
  Col,
  Container,
  Row,
  useAccordionButton,
  AccordionContext,
} from "react-bootstrap";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
import classNames from "classnames";

interface ModalProps {
  name: string;
  modesAndLines: string[];
  screenTypes: string[];
  stopId: string;
  status: string;
  eventKey: string;
}

const PlaceRow = (props: ModalProps): JSX.Element => {
  const { activeEventKey } = useContext(AccordionContext);
  const formatScreenTypes = () => {
    if (props.screenTypes.length === 0) {
      return "no screens";
    }
    return props.screenTypes.join(" · ");
  };

  const renderModesAndLinesIcons = () => {
    return props.modesAndLines.map((modeOrLine) => (
      <img
        className="place-mode-line-icon"
        key={modeOrLine}
        src={`/images/${modeOrLine.toLowerCase()}-icon.png`}
        alt=""
        width={38}
        height={20}
      />
    ));
  };

  const rowOnClick = useAccordionButton(props.eventKey);
  const isOpen = useContext(AccordionContext).activeEventKey === props.eventKey;
  return (
    <div
      className={classNames("place-row", {
        open: isOpen,
      })}
    >
      <Container fluid>
        <Row onClick={rowOnClick} className="align-items-center text-white">
          <Col lg="auto">
            {activeEventKey === props.eventKey ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </Col>
          <Col lg={4} className="place-name">
            {props.name}
          </Col>
          <Col lg="auto" className="pe-5">
            {renderModesAndLinesIcons()}
          </Col>
          <Col lg="auto" className="place-screen-types pe-5">
            {formatScreenTypes()}
          </Col>
          <Col lg="auto" className="place-stop-id">
            {props.stopId}
          </Col>
          <Col lg={3} className="text-center pe-3">
            {props.status}
          </Col>
        </Row>
      </Container>
      <Accordion.Collapse eventKey={props.eventKey}>
        <div className="screen-preview-container">Hello World</div>
      </Accordion.Collapse>
    </div>
  );
};

export default PlaceRow;
