/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import DaysPicker from "./DaysPicker";
import PriorityPicker from "./PriorityPicker";
import IntervalPicker from "./IntervalPicker";
import MessageTextBox from "./MessageTextBox";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DatePicker from "../../DatePicker";
import TimePicker from "../../TimePicker";
import {
  ArrowRightShort,
  CheckCircleFill,
  ExclamationTriangleFill,
  PlusLg,
  VolumeUpFill,
} from "react-bootstrap-icons";
import cx from "classnames";

const NewPaMessagePage = () => {
  const now = moment();

  const [startDate, setStartDate] = useState(now.format("L"));
  const [startTime, setStartTime] = useState(now.format("HH:mm"));
  const [endDate, setEndDate] = useState(now.format("L"));
  const [endTime, setEndTime] = useState(now.add(1, "hour").format("HH:mm"));
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioReviewed, setAudioReviewed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!audioPlaying) setAudioReviewed(false);
  }, [visualText, phoneticText]);

  const previewAudio = () => {
    if (audioPlaying) return;

    if (phoneticText.length === 0) {
      setPhoneticText(visualText);
    }
    setAudioPlaying(true);
  };

  // Called after the audio preview plays in full
  const onAudioEnded = () => {
    setAudioPlaying(false);
    setAudioReviewed(true);
  };

  const onAudioError = () => {
    setAudioPlaying(false);
    setErrorMessage(
      "Error occurred while fetching audio preview. Please try again.",
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
                <div className="datetime-picker-group">
                  <DatePicker
                    selectedDate={endDate}
                    onChange={setEndDate}
                    minDateString={startDate}
                    id="end-date-picker"
                  />
                  <TimePicker selectedTime={endTime} onChange={setEndTime} />
                </div>
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
            <Row>
              <Col>
                <MessageTextBox
                  id="visual-text-box"
                  text={visualText}
                  onChangeText={(text) => {
                    setVisualText(text);
                    setAudioPlaying(false);
                  }}
                  label="Text"
                />
              </Col>
              <Col md="auto" className="copy-button-col">
                <Button
                  disabled={visualText.length === 0}
                  className="copy-text-button"
                  onClick={() => {
                    setPhoneticText(visualText);
                    setAudioPlaying(false);
                  }}
                  aria-label="copy-visual-to-phonetic"
                >
                  <ArrowRightShort />
                </Button>
              </Col>
              <Col>
                {phoneticText.length > 0 ? (
                  <>
                    <MessageTextBox
                      id="phonetic-audio-text-box"
                      text={phoneticText}
                      onChangeText={(text) => {
                        setPhoneticText(text);
                        setAudioPlaying(false);
                      }}
                      disabled={phoneticText.length === 0}
                      label="Phonetic Audio"
                    />
                    <ReviewAudioButton
                      audioPlaying={audioPlaying}
                      audioReviewed={audioReviewed}
                      showErrorIcon={errorMessage.length > 0}
                      onClick={previewAudio}
                    />
                  </>
                ) : (
                  <>
                    <div className="form-label">Phonetic Audio</div>
                    <Card className="review-audio-card">
                      <ReviewAudioButton
                        audioPlaying={audioPlaying}
                        audioReviewed={audioReviewed}
                        disabled={visualText.length === 0}
                        onClick={previewAudio}
                      />
                    </Card>
                  </>
                )}
                {audioPlaying && (
                  <audio
                    src={`/api/pa-messages/preview_audio?text=${phoneticText}`}
                    autoPlay
                    onEnded={onAudioEnded}
                    onError={onAudioError}
                  />
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
        <div className="error-alert-container">
          <Alert
            show={errorMessage.length > 0}
            variant="primary"
            onClose={() => setErrorMessage("")}
            dismissible
            className="error-alert"
          >
            <ExclamationTriangleFill className="error-alert__icon" />
            <div className="error-alert__text">{errorMessage}</div>
          </Alert>
        </div>
      </Form>
    </div>
  );
};

interface ReviewAudioButtonProps {
  audioPlaying: boolean;
  audioReviewed: boolean;
  disabled?: boolean;
  showErrorIcon?: boolean;
  onClick: () => void;
}

const ReviewAudioButton = ({
  audioPlaying,
  audioReviewed,
  disabled,
  showErrorIcon,
  onClick,
}: ReviewAudioButtonProps) => {
  return audioReviewed ? (
    <div className="audio-reviewed-text">
      <span>
        <CheckCircleFill /> Audio reviewed
      </span>
      <Button className="review-audio-button" onClick={onClick} variant="link">
        Replay
      </Button>
    </div>
  ) : (
    <Button
      disabled={!audioPlaying && disabled}
      className={cx("review-audio-button", {
        "review-audio-button--audio-playing": audioPlaying,
      })}
      variant="link"
      onClick={onClick}
    >
      {showErrorIcon ? (
        <ExclamationTriangleFill fill="#FFC107" height={16} />
      ) : (
        <VolumeUpFill height={16} />
      )}
      {audioPlaying ? "Reviewing audio" : "Review audio"}
    </Button>
  );
};

export default NewPaMessagePage;
