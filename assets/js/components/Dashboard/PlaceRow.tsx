import React, { useContext } from "react";
import {
  Accordion,
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
  const rowOnClick = useAccordionButton(props.eventKey);
  const isOpen = activeEventKey === props.eventKey;
  const hasScreens = props.screenTypes.length !== 0;

  function formatScreenTypes() {
    if (props.screenTypes.length === 0) {
      return "no screens";
    }
    return props.screenTypes.join(" · ");
  }

  function renderModesAndLinesIcons() {
    return props.modesAndLines.map((modeOrLine) => (
      <img
        className="place-mode-line-icon"
        key={modeOrLine}
        src={`/images/pills/${modeOrLine.toLowerCase()}.png`}
        alt=""
        width={38}
        height={20}
      />
    ));
  }

  return (
    <div
      key={props.eventKey}
      className={classNames("place-row", {
        open: isOpen,
        disabled: !hasScreens,
      })}
    >
      <Container fluid>
        <Row
          onClick={hasScreens ? rowOnClick : () => undefined}
          className="align-items-center text-white"
        >
          <Col
            lg="auto"
            className={classNames({
              "hidden-toggle": !hasScreens,
            })}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Col>
          <Col lg={2} className="place-name">
            {props.name}
          </Col>
          <Col lg={4} className="pe-5 d-flex justify-content-end">
            {renderModesAndLinesIcons()}
          </Col>
          <Col
            lg={2}
            className="place-screen-types pe-5 d-flex justify-content-center"
          >
            {formatScreenTypes()}
          </Col>
          <Col lg={1} className="place-stop-id">
            {props.stopId}
          </Col>
          <Col lg={2} className="d-flex justify-content-end pe-3 place-status">
            {hasScreens ? props.status : "-"}
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
