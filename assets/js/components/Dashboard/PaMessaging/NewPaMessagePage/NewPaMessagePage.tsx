import React, { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import DaysPicker from "./DaysPicker";
import PriorityPicker from "./PriorityPicker";
import IntervalPicker from "./IntervalPicker";
import MessageTextBox from "./MessageTextBox";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DatePicker from "../../DatePicker";
import TimePicker from "../../TimePicker";
import { ArrowRightShort, PlusLg, VolumeUpFill } from "react-bootstrap-icons";

const NewPaMessagePage = () => {
  const now = moment();

  const [startDate, setStartDate] = useState(now.format("L"));
  const [startTime, setStartTime] = useState(now.format("HH:mm"));
  const [endDate, setEndDate] = useState(now.format("L"));
  const [endTime, setEndTime] = useState(now.add(1, "hour").format("HH:mm"));
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState(4);
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");

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
        <Card className="when-card">
          <div className="title">When</div>
          <div className="label body--regular">Start</div>
          <Row md="auto" className="start-datetime">
            <DatePicker
              selectedDate={startDate}
              onChange={setStartDate}
              maxDateString={endDate}
            />
            <TimePicker selectedTime={startTime} onChange={setStartTime} />
          </Row>
          <div className="label body--regular">End</div>
          <Row md="auto" className="end-datetime">
            <DatePicker
              selectedDate={endDate}
              onChange={setEndDate}
              minDateString={startDate}
            />
            <TimePicker selectedTime={endTime} onChange={setEndTime} />
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
              >
                <ArrowRightShort />
              </Button>
            </Col>
            <Col>
              {phoneticText.length > 0 ? (
                <MessageTextBox
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
    </div>
  );
};

export default NewPaMessagePage;
