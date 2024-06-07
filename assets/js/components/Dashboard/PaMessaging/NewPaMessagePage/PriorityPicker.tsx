import React from "react";
import { Dropdown, Form, Row } from "react-bootstrap";

interface Props {
  priority: number;
  onSelectPriority: (priority: number) => void;
}
const PriorityPicker = ({ priority, onSelectPriority }: Props) => {
  return (
    <Form.Group>
      <Form.Label htmlFor="priority-picker" className="label body--regular">
        Priority
      </Form.Label>
      <Row md="auto" className="align-items-center">
        <Dropdown
          id="priority-picker"
          onSelect={(eventKey) => onSelectPriority(Number(eventKey))}
        >
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
    </Form.Group>
  );
};

export default PriorityPicker;
