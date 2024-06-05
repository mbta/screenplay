import React, { ComponentType, useReducer, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import fp from "lodash/fp";
import _ from "lodash";
import { ArrowRightShort, PlusLg, VolumeUpFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Value } from "react-calendar/dist/cjs/shared/types";

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

interface NewPaMessagePageState {
  selectedStartDate: string;
  selectedStartTime: string;
  selectedEndDate: string;
  selectedEndTime: string;
  selectedDayLabel: string;
  selectedDays: number[];
  selectedPriority: number;
  selectedInterval: number;
  visualText: string;
  phoneticText: string;
}

type NewPaMessagePageReducerAction =
  | {
      type: "SET_START_DATE";
      date: string;
    }
  | {
      type: "SET_START_TIME";
      time: string;
    }
  | {
      type: "SET_END_DATE";
      date: string;
    }
  | {
      type: "SET_END_TIME";
      time: string;
    }
  | {
      type: "SET_DAY_LABEL";
      dayLabel: string;
    }
  | {
      type: "SET_SELECTED_DAYS";
      days: number[];
    }
  | {
      type: "SET_PRIORITY";
      priority: number;
    }
  | {
      type: "SET_INTERVAL";
      interval: number;
    }
  | {
      type: "SET_VISUAL_TEXT";
      visualText: string;
    }
  | {
      type: "SET_PHONETIC_TEXT";
      phoneticText: string;
    };

const reducer = (
  state: NewPaMessagePageState,
  action: NewPaMessagePageReducerAction
) => {
  switch (action.type) {
    case "SET_START_DATE":
      return fp.set("selectedStartDate", action.date, state);
    case "SET_START_TIME":
      return fp.set("selectedStartTime", action.time, state);
    case "SET_END_DATE":
      return fp.set("selectedEndDate", action.date, state);
    case "SET_END_TIME":
      return fp.set("selectedEndTime", action.time, state);
    case "SET_DAY_LABEL":
      return fp.set("selectedDayLabel", action.dayLabel, state);
    case "SET_SELECTED_DAYS":
      return fp.set("selectedDays", action.days, state);
    case "SET_PRIORITY":
      return fp.set("selectedPriority", action.priority, state);
    case "SET_INTERVAL":
      return fp.set("selectedInterval", action.interval, state);
    case "SET_VISUAL_TEXT":
      return fp.set("visualText", action.visualText, state);
    case "SET_PHONETIC_TEXT":
      return fp.set("phoneticText", action.phoneticText, state);
  }
};

const NewPaMessagePage: ComponentType = () => {
  const now = moment();
  const initialState: NewPaMessagePageState = {
    selectedStartDate: now.format("L"),
    selectedStartTime: now.format("h:mm A"),
    selectedEndDate: now.format("L"),
    selectedEndTime: now.add(1, "hour").format("h:mm A"),
    selectedDayLabel: "All days",
    selectedDays: [1, 2, 3, 4, 5, 6, 7],
    selectedPriority: 2,
    selectedInterval: 4,
    visualText: "",
    phoneticText: "",
  };

  const [state, dispath] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  return (
    <div className="new-pa-message-page">
      <div className="new-pa-message-page__header">New PA/ESS message</div>
      <Container fluid>
        <Row md="auto" className="align-items-center">
          <Button variant="link" className="pr-0">
            Associate with alert
          </Button>
          (Optional)
        </Row>
        <Row>
          <div className="new-pa-message-page__associate-alert-subtext">
            Linking will allow you to share end time with alert, and import
            location and message.
          </div>
        </Row>
        <WhenCard pageState={state} dispatch={dispath} />
        <WhereCard pageState={state} dispatch={dispath} />
        <MessageCard pageState={state} dispatch={dispath} />
        <Row
          md="auto"
          className="justify-content-end new-pa-message-page__form-buttons"
        >
          <Button className="cancel-button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button className="submit-button">Submit</Button>
        </Row>
      </Container>
    </div>
  );
};

interface CardProps {
  pageState: NewPaMessagePageState;
  dispatch: React.Dispatch<NewPaMessagePageReducerAction>;
}

const WhenCard: ComponentType<CardProps> = ({
  pageState,
  dispatch,
}: CardProps) => {
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
    <Card className="new-pa-message-page__when">
      <div className="title">When</div>
      <div className="label body--regular">Start</div>
      <Row md="auto" className="start-datetime">
        <DatePicker
          selectedDate={selectedStartDate}
          onChange={(date) => {
            dispatch({
              type: "SET_START_DATE",
              date: moment(date as Date).format("L"),
            });
          }}
          maxDateString={selectedEndDate}
        />
        <Form>
          <Form.Control
            type="time"
            value={selectedStartTime}
            onChange={(time) =>
              dispatch({
                type: "SET_START_TIME",
                time: time.target.value,
              })
            }
          />
        </Form>
      </Row>
      <div className="label body--regular">End</div>
      <Row md="auto" className="end-datetime">
        <DatePicker
          selectedDate={selectedEndDate}
          onChange={(date) => {
            dispatch({
              type: "SET_END_DATE",
              date: moment(date as Date).format("L"),
            });
          }}
          minDateString={selectedStartDate}
        />
        <TimePicker selectedTime={selectedEndTime} onChange={() => undefined} />
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
              {Object.keys(DayItem).map((dayItem: string) => {
                const label = DayItem[dayItem as keyof typeof DayItem];
                return (
                  <Dropdown.Item
                    key={dayItem}
                    eventKey={dayItem}
                    active={selectedDayLabel === label}
                  >
                    {label}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
          {selectedDayLabel == DayItem.Select && (
            <Form className="m-0">
              {Object.keys(DayOfWeek)
                .filter((k) => isNaN(Number(k)))
                .map((label: string) => {
                  const dayOfWeekValue =
                    DayOfWeek[label as keyof typeof DayOfWeek];
                  return (
                    <Form.Check
                      key={label}
                      inline
                      checked={selectedDays.includes(dayOfWeekValue)}
                      label={label.substring(0, 3).toUpperCase()}
                      type="checkbox"
                      onChange={(checkbox) => {
                        if (checkbox.target.checked) {
                          dispatch({
                            type: "SET_SELECTED_DAYS",
                            days: fp.concat(selectedDays, [dayOfWeekValue]),
                          });
                        } else {
                          dispatch({
                            type: "SET_SELECTED_DAYS",
                            days: fp.pull(dayOfWeekValue, selectedDays),
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

const WhereCard: ComponentType<CardProps> = (_props) => {
  return (
    <Card className="new-pa-message-page__where">
      <div className="title">Where</div>
      <Button className="add-stations-zones-button">
        <PlusLg width={12} height={12} /> Add Stations & Zones
      </Button>
    </Card>
  );
};

const MessageCard: ComponentType<CardProps> = ({
  pageState,
  dispatch,
}: CardProps) => {
  const { visualText, phoneticText } = pageState;
  return (
    <Card className="new-pa-message-page__message">
      <div className="title">Message</div>
      <Row className="align-items-center">
        <Col>
          <Form>
            <Form.Label>Text</Form.Label>
            <Form.Control
              className="visual-text-input"
              as="textarea"
              value={visualText}
              onChange={(textbox) =>
                dispatch({
                  type: "SET_VISUAL_TEXT",
                  visualText: textbox.target.value,
                })
              }
            />
          </Form>
        </Col>
        <Col md="auto">
          <Button
            disabled={visualText.length === 0}
            className="copy-text-button"
            onClick={() =>
              dispatch({
                type: "SET_PHONETIC_TEXT",
                phoneticText: visualText,
              })
            }
          >
            <ArrowRightShort />
          </Button>
        </Col>
        <Col>
          {phoneticText.length > 0 ? (
            <Form>
              <Form.Label>Phonetic Audio</Form.Label>
              <Form.Control
                className="phonetic-text-input"
                as="textarea"
                disabled={phoneticText.length === 0}
                value={phoneticText}
                onChange={(textbox) =>
                  dispatch({
                    type: "SET_PHONETIC_TEXT",
                    phoneticText: textbox.target.value,
                  })
                }
              />
            </Form>
          ) : (
            <Card className="review-audio-card">
              <Button className="review-audio-button" variant="link">
                <VolumeUpFill height={12} />
                Review audio
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: Value) => void;
  minDateString?: string;
  maxDateString?: string;
}

const DatePicker: ComponentType<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDateString,
  maxDateString,
}: DatePickerProps) => {
  const minDate = minDateString ? new Date(minDateString) : new Date(-1);
  const maxDate = maxDateString
    ? new Date(maxDateString)
    : new Date(Number.MAX_SAFE_INTEGER);

  return (
    <OverlayTrigger
      placement="bottom-start"
      rootClose
      trigger="click"
      overlay={
        <Popover className="calendar-tooltip">
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            defaultValue={new Date(selectedDate)}
            onChange={(date) => {
              onChange(date);
              document.body.click();
            }}
          />
        </Popover>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <Form ref={ref} {...triggerHandler}>
          <Form.Control readOnly value={selectedDate} />
        </Form>
      )}
    </OverlayTrigger>
  );
};

interface TimePickerProps {
  selectedTime: string;
  onChange: (time: string) => void;
}

const TimePicker: ComponentType<TimePickerProps> = ({
  selectedTime,
  onChange,
}: TimePickerProps) => {
  const timeMoment = moment(selectedTime, "h:mm A");
  const [selectedHour, setSelectedHour] = useState(timeMoment.format("hh"));
  const [selectedMinute, setSelectedMinute] = useState(timeMoment.format("mm"));
  const [selectedAmPm, setSelectedAmPm] = useState(timeMoment.format("A"));

  return (
    <OverlayTrigger
      placement="bottom-start"
      rootClose
      trigger="click"
      popperConfig={{
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              rootBoundary: "document",
              padding: 10,
            },
          },
        ],
      }}
      overlay={
        <Popover className="time-tooltip">
          {/* <Calendar
            minDate={minDate}
            maxDate={maxDate}
            defaultValue={new Date(selectedDate)}
            onChange={(date) => {
              onChange(date);
              document.body.click();
            }}
          /> */}
          <Card className="time-picker-card">
            <Container fluid>
              <Row>
                <Col className="hour-col">
                  {fp.range(0, 13).map((hour) => {
                    return (
                      <Button key={`hour-${hour}`}>
                        {hour.toString().padStart(2, "0")}
                      </Button>
                    );
                  })}
                </Col>
                <Col className="minute-col">
                  {_.range(0, 60, 5).map((minute) => {
                    return (
                      <Button key={`minute-${minute}`}>
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    );
                  })}
                </Col>
                <Col className="ampm-col">
                  <Button>AM</Button>
                  <Button>PM</Button>
                </Col>
              </Row>
            </Container>
          </Card>
        </Popover>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <Form ref={ref} {...triggerHandler}>
          <Form.Control readOnly value={selectedTime} />
        </Form>
      )}
    </OverlayTrigger>
  );
};

export default NewPaMessagePage;
