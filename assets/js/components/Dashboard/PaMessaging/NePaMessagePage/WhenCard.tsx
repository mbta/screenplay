import React from "react";
import { Card, Row, Dropdown, Form, Col } from "react-bootstrap";
import DatePicker from "../../DatePicker";
import TimePicker from "../../TimePicker";
import {
  NewPaMessagePageState,
  NewPaMessagePageReducerAction,
} from "./NewPaMessagePage";
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
  pageState: NewPaMessagePageState;
  dispatch: React.Dispatch<NewPaMessagePageReducerAction>;
}

const WhenCard = ({ pageState, dispatch }: Props) => {
  const {
    selectedStartDate,
    selectedStartTime,
    selectedEndDate,
    selectedEndTime,
    selectedDayLabel,
    selectedDays,
    selectedPriority,
    selectedInterval,
  } = pageState;

  return (
    <Card className="when-card">
      <div className="title">When</div>
      <div className="label body--regular">Start</div>
      <Row md="auto" className="start-datetime">
        <DatePicker
          selectedDate={selectedStartDate}
          onChange={(date) => {
            dispatch({
              type: "SET_START_DATE",
              date: date,
            });
          }}
          maxDateString={selectedEndDate}
        />
        <TimePicker
          selectedTime={selectedStartTime}
          onChange={(time: string) =>
            dispatch({
              type: "SET_START_TIME",
              time: time,
            })
          }
        />
      </Row>
      <div className="label body--regular">End</div>
      <Row md="auto" className="end-datetime">
        <DatePicker
          selectedDate={selectedEndDate}
          onChange={(date) => {
            dispatch({
              type: "SET_END_DATE",
              date: date,
            });
          }}
          minDateString={selectedStartDate}
        />
        <TimePicker
          selectedTime={selectedEndTime}
          onChange={(time: string) =>
            dispatch({ type: "SET_END_TIME", time: time })
          }
        />
      </Row>
      <Row className="days">
        <div className="label body--regular">Days</div>
        <Row md="auto" className="align-items-center">
          <Dropdown
            onSelect={(eventKey) => {
              if (eventKey === null) return;

              dispatch({ type: "SET_DAY_LABEL", dayLabel: eventKey });

              switch (eventKey) {
                case DayItem.All:
                case DayItem.Select:
                  dispatch({
                    type: "SET_SELECTED_DAYS",
                    days: [1, 2, 3, 4, 5, 6, 7],
                  });
                  break;
                case DayItem.Weekday:
                  dispatch({
                    type: "SET_SELECTED_DAYS",
                    days: [1, 2, 3, 4, 5],
                  });
                  break;
                case DayItem.Weekend:
                  dispatch({ type: "SET_SELECTED_DAYS", days: [6, 7] });
              }
            }}
          >
            <Dropdown.Toggle>{selectedDayLabel}</Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.values(DayItem).map((dayItem) => {
                return (
                  <Dropdown.Item
                    key={dayItem}
                    eventKey={dayItem}
                    active={selectedDayLabel === dayItem}
                  >
                    {dayItem}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
          {selectedDayLabel == DayItem.Select && (
            <Form className="days-form">
              {DAYS_OF_WEEK.map(({ label, value }) => {
                return (
                  <Form.Check
                    key={value}
                    inline
                    checked={selectedDays.includes(value)}
                    label={label}
                    type="checkbox"
                    onChange={(checkbox) => {
                      if (checkbox.target.checked) {
                        dispatch({
                          type: "SET_SELECTED_DAYS",
                          days: fp.concat(selectedDays, [value]),
                        });
                      } else {
                        dispatch({
                          type: "SET_SELECTED_DAYS",
                          days: fp.pull(value, selectedDays),
                        });
                      }
                    }}
                  />
                );
              })}
            </Form>
          )}
        </Row>
      </Row>
      <Row md="auto">
        <Col>
          <div className="label body--regular">Priority</div>
          <Row md="auto" className="align-items-center">
            <Dropdown
              onSelect={(eventKey) =>
                dispatch({
                  type: "SET_PRIORITY",
                  priority: Number(eventKey),
                })
              }
            >
              <Dropdown.Toggle>{selectedPriority}</Dropdown.Toggle>
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
                      active={selectedPriority === index}
                    >
                      <div>{index}</div>
                      <div>{label}</div>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Row>
        </Col>
        <Col>
          <div className="label body--regular">Interval (min)</div>
          <Row md="auto" className="align-items-center">
            <Form className="m-0 interval">
              <Form.Control
                value={selectedInterval}
                type="number"
                onChange={(input) => {
                  dispatch({
                    type: "SET_INTERVAL",
                    interval: Number(input.target.value),
                  });
                }}
              />
            </Form>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default WhenCard;
