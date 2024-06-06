import React from "react";
import { Dropdown, Row } from "react-bootstrap";

interface Props {
  priority: number;
  onSelectPriority: (priority: number) => void;
}
const PriorityPicker = ({ priority, onSelectPriority }: Props) => {
  return (
    <>
      <div className="label body--regular">Priority</div>
      <Row md="auto" className="align-items-center">
        <Dropdown onSelect={(eventKey) => onSelectPriority(Number(eventKey))}>
          <Dropdown.Toggle>{priority}</Dropdown.Toggle>
          <Dropdown.Menu>
            {[
              "Emergency",
              "Current Service Disruption",
              "Planned Service Disruption",
              "PSA Message",
            ].map((label, index) => {
              return (
                <Dropdown.Item
                  key={label}
                  eventKey={index}
                  active={priority === index}
                >
                  <div>{index}</div>
                  <div>{label}</div>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </Row>
    </>
  );
};

export default PriorityPicker;
