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
  const MESSAGE_PRIORITY_MAP: Map<string, number> = new Map<string, number>([
    ["Emergency Test", 1],
    ["Ongoing service disruption", 3],
    ["Upcoming service disruption", 4],
    ["PSA Message", 5],
  ]);

  // Non-PA messages need a priority in between Emergency (1) and Current service Disruption (2)
  // But here we want to just show the labels as is, 1 2 3 4 rather than 1 3 4 5 so adjust here
  const adjustPriorityForLabel = (priority: number): number =>
    priority === 1 ? priority : priority - 1;

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
            {adjustPriorityForLabel(priority)}
          </Dropdown.Toggle>
          <Dropdown.Menu role="listbox">
            {Array.from(MESSAGE_PRIORITY_MAP).map((value: [string, number]) => {
              const label = value[0];
              const messagePriority = value[1];

              return (
                <Dropdown.Item
                  role="option"
                  key={messagePriority}
                  eventKey={messagePriority}
                  active={priority === messagePriority}
                >
                  <div>{adjustPriorityForLabel(messagePriority)}</div>
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
