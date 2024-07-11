import React, { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import DaysPicker from "./DaysPicker";
import PriorityPicker from "./PriorityPicker";
import IntervalPicker from "./IntervalPicker";
import MessageTextBox from "./MessageTextBox";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DatePicker from "../../DatePicker";
import TimePicker from "../../TimePicker";
import { ArrowRightShort, PlusLg, VolumeUpFill } from "react-bootstrap-icons";
import {
  useAssociatedAlertContext,
  useAssociatedAlertDispatchContext,
} from "../../../../hooks/useScreenplayContext";
import { Alert, ActivePeriod } from "../../../../models/alert";
import { getAlertEarliestStartLatestEnd } from "../../../../util";

const NewPaMessagePage = () => {
  const now = moment();

  const associatedAlertState = useAssociatedAlertContext();
  const { associatedAlert, importMessage, endWithEffectPeriod } =
    associatedAlertState;

  const dispatch = useAssociatedAlertDispatchContext();
  const [startDate, setStartDate] = useState(now.format("L"));
  const [startTime, setStartTime] = useState(now.format("HH:mm"));
  const [endDate, setEndDate] = useState(now.format("L"));
  const [endTime, setEndTime] = useState(
    endWithEffectPeriod ? "" : now.add(1, "hour").format("HH:mm"),
  );
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState(
    importMessage ? associatedAlert.header : "",
  );
  const [phoneticText, setPhoneticText] = useState(
    importMessage ? associatedAlert.header : "",
  );

  const navigate = useNavigate();

  const formatActivePeriod = (activePeriods: ActivePeriod[]) => {
    const [start, end] = getAlertEarliestStartLatestEnd(activePeriods);

    return (
      <div className="affect-period">
        Alert Effect period: {start} - {end}
      </div>
    );
  };

  return (
    <div className="new-pa-message-page">
      <Form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="new-pa-message-page__header">New PA/ESS message</div>
        <Container fluid>
          <Row md="auto" className="align-items-center">
            {associatedAlert.id ? (
              <div className="associated-alert-header">
                Associated Alert: Alert ID {associatedAlert.id}
                <Button
                  variant="link"
                  onClick={() => navigate("associate-alert")}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    setVisualText("");
                    setPhoneticText("");
                    dispatch({
                      type: "SET_ASSOCIATED_ALERT",
                      associatedAlert: {} as Alert,
                      endWithEffectPeriod: false,
                      importLocations: false,
                      importMessage: false,
                    });
                  }}
                >
                  Clear
                </Button>
                {formatActivePeriod(associatedAlert.active_period)}
              </div>
            ) : (
              <>
                <Button
                  variant="link"
                  className="pr-0"
                  onClick={() => navigate("associate-alert")}
                >
                  Associate with alert
                </Button>
                (Optional)
              </>
            )}
          </Row>
          {!associatedAlert.id && (
            <Row>
              <div className="new-pa-message-page__associate-alert-subtext">
                Linking will allow you to share end time with alert, and import
                location and message.
              </div>
            </Row>
          )}
          <Card className="when-card">
            <div className="title">When</div>
            <Row md="auto" className="start-datetime">
              <Form.Group>
                <Form.Label
                  className="label body--regular"
                  htmlFor="start-date-picker"
                >
                  Start
                </Form.Label>
                <div className="datetime-picker-group">
                  <DatePicker
                    selectedDate={startDate}
                    onChange={setStartDate}
                    maxDateString={endDate}
                    id="start-date-picker"
                  />
                  <TimePicker
                    selectedTime={startTime}
                    onChange={setStartTime}
                  />
                </div>
              </Form.Group>
            </Row>
            <Row md="auto">
              <Form.Group className="end-datetime">
                <Form.Label
                  className="label body--regular"
                  htmlFor="end-date-picker"
                >
                  End
                </Form.Label>
                {associatedAlert.id && (
                  <Form.Check
                    className="effect-period-switch"
                    type="switch"
                    checked={endWithEffectPeriod}
                    label="At end of alert"
                    onChange={() => {
                      endWithEffectPeriod
                        ? setEndTime(now.add(1, "hour").format("HH:mm"))
                        : setEndTime("");

                      dispatch({
                        type: "SET_ASSOCIATED_ALERT",
                        ...associatedAlertState,
                        endWithEffectPeriod: !endWithEffectPeriod,
                      });
                    }}
                  />
                )}
                {!endWithEffectPeriod && (
                  <div className="datetime-picker-group">
                    <DatePicker
                      selectedDate={endDate}
                      onChange={setEndDate}
                      minDateString={startDate}
                      id="end-date-picker"
                    />
                    <TimePicker selectedTime={endTime} onChange={setEndTime} />
                  </div>
                )}
              </Form.Group>
            </Row>
            <Row className="days">
              <DaysPicker days={days} onChangeDays={setDays} />
            </Row>
            <Row md="auto">
              <Col>
                <PriorityPicker
                  priority={priority}
                  onSelectPriority={setPriority}
                />
              </Col>
              <Col>
                <IntervalPicker
                  interval={interval}
                  onChangeInterval={setInterval}
                />
              </Col>
            </Row>
          </Card>
          <Card className="where-card">
            <div className="title">Where</div>
            <Button className="add-stations-zones-button">
              <PlusLg width={12} height={12} /> Add Stations & Zones
            </Button>
          </Card>
          <Card className="message-card">
            <div className="title">Message</div>
            <Row className="align-items-center">
              <Col>
                <MessageTextBox
                  id="visual-text-box"
                  text={visualText}
                  onChangeText={setVisualText}
                  label="Text"
                />
              </Col>
              <Col md="auto">
                <Button
                  disabled={visualText.length === 0}
                  className="copy-text-button"
                  onClick={() => setPhoneticText(visualText)}
                  aria-label="copy-visual-to-phonetic"
                >
                  <ArrowRightShort />
                </Button>
              </Col>
              <Col>
                {phoneticText.length > 0 ? (
                  <MessageTextBox
                    id="phonetic-audio-text-box"
                    text={phoneticText}
                    onChangeText={setPhoneticText}
                    disabled={phoneticText.length === 0}
                    label="Phonetic Audio"
                  />
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
          <Row
            md="auto"
            className="justify-content-end new-pa-message-page__form-buttons"
          >
            <Button
              className="cancel-button"
              onClick={() =>
                window.history.length > 1 ? navigate(-1) : window.close()
              }
            >
              Cancel
            </Button>
            <Button type="submit" className="submit-button">
              Submit
            </Button>
          </Row>
        </Container>
      </Form>
    </div>
  );
};

export default NewPaMessagePage;
