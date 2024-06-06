import React, { useReducer } from "react";
import { Button, Container, Row } from "react-bootstrap";
import WhenCard from "./WhenCard";
import WhereCard from "./WhereCard";
import MessageCard from "./MessageCard";
import fp from "lodash/fp";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export interface NewPaMessagePageState {
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

export type NewPaMessagePageReducerAction =
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
  action: NewPaMessagePageReducerAction,
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

const NewPaMessagePage = () => {
  const now = moment();
  const initialState: NewPaMessagePageState = {
    selectedStartDate: now.format("L"),
    selectedStartTime: now.format("HH:mm"),
    selectedEndDate: now.format("L"),
    selectedEndTime: now.add(1, "hour").format("HH:mm"),
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

export default NewPaMessagePage;
