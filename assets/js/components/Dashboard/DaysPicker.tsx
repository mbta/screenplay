import React, { useState } from "react";
import { Col, Dropdown, Form, Row } from "react-bootstrap";
import fp from "lodash/fp";
import cx from "classnames";
import * as paMessageStyles from "Styles/pa-messages.module.scss";

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

const DAY_MAPPINGS = [
  { key: DayItem.All, value: [1, 2, 3, 4, 5, 6, 7] },
  { key: DayItem.Weekday, value: [1, 2, 3, 4, 5] },
  { key: DayItem.Weekend, value: [6, 7] },
];

interface Props {
  days: number[];
  onChangeDays: (days: number[]) => void;
  error: string | null;
}

const DaysPicker = ({ days, onChangeDays, error }: Props) => {
  const [dayLabel, setDayLabel] = useState(
    fp.find(
      ({ value }) => fp.isEqual(value, fp.sortBy(fp.identity, days)),
      DAY_MAPPINGS,
    )?.key ?? DayItem.Select,
  );

  return (
    <Form.Group>
      <Form.Label className={paMessageStyles.formLabel} htmlFor="days-picker">
        Days
      </Form.Label>
      <Row
        md={1}
        lg="auto"
        className={cx("align-items-center", { "is-invalid": !!error })}
      >
        <Col>
          <Dropdown
            className={cx(
              paMessageStyles.dropdown,
              paMessageStyles.daysDropdown,
            )}
            onSelect={(eventKey) => {
              if (eventKey === null) return;

              setDayLabel(eventKey as DayItem);
              onChangeDays(
                fp.find(({ key }) => key === eventKey, DAY_MAPPINGS)?.value ?? [
                  1, 2, 3, 4, 5, 6, 7,
                ],
              );
            }}
          >
            <Dropdown.Toggle
              id="days-picker"
              className="w-100 d-flex align-items-center justify-content-between"
            >
              {dayLabel}
            </Dropdown.Toggle>
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
                  className="pb-1 pt-2 mb-0 me-3"
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
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
};

export default DaysPicker;
