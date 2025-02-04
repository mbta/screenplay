import React from "react";
import { Dropdown, Form, Row } from "react-bootstrap";
import * as paMessageStyles from "Styles/pa-messages.module.scss";

interface Props {
  priority: number;
  onSelectPriority: (priority: number) => void;
  disabled?: boolean;
}
const PriorityPicker = ({
  priority,
  onSelectPriority,
  disabled = false,
}: Props) => {
  return (
    <Form.Group>
      <Form.Label
        htmlFor="priority-picker"
        className={paMessageStyles.formLabel}
      >
        Priority
      </Form.Label>
      <Row md="auto" className="align-items-center">
        <Dropdown
          className={paMessageStyles.dropdown}
          onSelect={(eventKey) => onSelectPriority(Number(eventKey))}
        >
          <Dropdown.Toggle id="priority-picker" disabled={disabled}>
            {priority}
          </Dropdown.Toggle>
          <Dropdown.Menu role="listbox">
            {[
              "Emergency",
              "Ongoing service disruption",
              "Upcoming service disruption",
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
                  <div>{priorityIndex}</div>
                  <div className={paMessageStyles.smaller}>{label}</div>
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
