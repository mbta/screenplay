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
        <Dropdown onSelect={(eventKey) => onSelectPriority(Number(eventKey))}>
          <Dropdown.Toggle id="priority-picker">{priority}</Dropdown.Toggle>
          <Dropdown.Menu role="listbox">
            {[
              "Emergency",
              "Current Service Disruption",
              "Planned Service Disruption",
              "PSA Message",
            ].map((label, index) => {
              const priorityIndex = index + 1;

              return (
                <Dropdown.Item
                  role="option"
                  key={label}
                  eventKey={priorityIndex}
                  active={priority === priorityIndex}
                >
                  <div className="item-value">{priorityIndex}</div>
                  <div className="item-label">{label}</div>
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
