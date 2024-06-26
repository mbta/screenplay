import React, { useState } from "react";
import { Col, Dropdown, Form, Row } from "react-bootstrap";
import fp from "lodash/fp";

enum DayItem {
  All = "All days",
  Weekday = "Weekday",
  Weekend = "Weekend",
  Select = "Select days",
}

enum DayOfWeek {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

const DAYS_OF_WEEK = [
  { label: "Mon", value: DayOfWeek.Monday },
  { label: "Tue", value: DayOfWeek.Tuesday },
  { label: "Wed", value: DayOfWeek.Wednesday },
  { label: "Thu", value: DayOfWeek.Thursday },
  { label: "Fri", value: DayOfWeek.Friday },
  { label: "Sat", value: DayOfWeek.Saturday },
  { label: "Sun", value: DayOfWeek.Sunday },
];

interface Props {
  days: number[];
  onChangeDays: (days: number[]) => void;
}

const DaysPicker = ({ days, onChangeDays }: Props) => {
  const [dayLabel, setDayLabel] = useState("All days");

  return (
    <Form.Group>
      <Form.Label className="label body--regular" htmlFor="days-picker">
        Days
      </Form.Label>
      <Row md={1} lg="auto" className="align-items-center">
        <Col>
          <Dropdown
            onSelect={(eventKey) => {
              if (eventKey === null) return;

              setDayLabel(eventKey);

              switch (eventKey) {
                case DayItem.All:
                case DayItem.Select:
                  onChangeDays([1, 2, 3, 4, 5, 6, 7]);

                  break;
                case DayItem.Weekday:
                  onChangeDays([1, 2, 3, 4, 5]);

                  break;
                case DayItem.Weekend:
                  onChangeDays([6, 7]);
              }
            }}
          >
            <Dropdown.Toggle id="days-picker">{dayLabel}</Dropdown.Toggle>
            <Dropdown.Menu role="listbox">
              {Object.values(DayItem).map((dayItem) => {
                return (
                  <Dropdown.Item
                    role="option"
                    key={dayItem}
                    eventKey={dayItem}
                    active={dayLabel === dayItem}
                  >
                    {dayItem}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        {dayLabel === DayItem.Select && (
          <Col md="auto">
            {DAYS_OF_WEEK.map(({ label, value }) => {
              return (
                <Form.Check
                  className="days-form"
                  key={value}
                  inline
                  checked={days.includes(value)}
                  label={label}
                  type="checkbox"
                  onChange={(checkbox) => {
                    if (checkbox.target.checked) {
                      onChangeDays(fp.concat(days, [value]));
                    } else {
                      onChangeDays(fp.pull(value, days));
                    }
                  }}
                />
              );
            })}
          </Col>
        )}
      </Row>
    </Form.Group>
  );
};

export default DaysPicker;
