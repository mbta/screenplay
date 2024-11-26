/* eslint-disable jsx-a11y/media-has-caption */
import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import DaysPicker from "Components/DaysPicker";
import PriorityPicker from "Components/PriorityPicker";
import IntervalPicker from "Components/IntervalPicker";
import MessageTextBox from "Components/MessageTextBox";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  ArrowRightShort,
  CheckCircleFill,
  ExclamationTriangleFill,
  PlusLg,
  VolumeUpFill,
} from "react-bootstrap-icons";
import cx from "classnames";
import { ActivePeriod, Alert as AlertModel } from "Models/alert";
import { getAlertEarliestStartLatestEnd } from "../../../util";
import { AudioPreview, Page } from "./types";
import SelectedSignsByRouteTags from "./SelectedSignsByRouteTags";
import { Place } from "Models/place";
const MAX_TEXT_LENGTH = 2000;

interface Props {
  title: string;
  days: number[];
  startDate: string;
  setStartDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  interval: string;
  navigateTo: (page: Page) => void;
  phoneticText: string;
  priority: number;
  setDays: Dispatch<SetStateAction<number[]>>;
  onError: (error: string | null) => void;
  setInterval: Dispatch<SetStateAction<string>>;
  setPhoneticText: Dispatch<SetStateAction<string>>;
  setPriority: Dispatch<SetStateAction<number>>;
  setVisualText: Dispatch<SetStateAction<string>>;
  onClearAssociatedAlert: () => void;
  setEndWithEffectPeriod: Dispatch<SetStateAction<boolean>>;
  visualText: string;
  associatedAlert: AlertModel | string | null;
  endWithEffectPeriod: boolean;
  signIds: string[];
  setSignIds: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
  onSubmit: () => void;
  setAudioState: Dispatch<SetStateAction<AudioPreview>>;
  audioState: AudioPreview;
  hide: boolean;
}

const MainForm = ({
  title,
  days,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  interval,
  navigateTo,
  phoneticText,
  priority,
  setDays,
  onError,
  setInterval,
  setPhoneticText,
  setPriority,
  setVisualText,
  setEndWithEffectPeriod,
  onClearAssociatedAlert,
  visualText,
  associatedAlert,
  endWithEffectPeriod,
  signIds,
  setSignIds,
  places,
  busRoutes,
  onSubmit,
  hide,
  audioState,
  setAudioState,
}: Props) => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

  const priorityToIntervalMap: { [priority: number]: string } = {
    1: "1",
    2: "4",
    3: "10",
    4: "12",
  };

  const previewAudio = () => {
    if (audioState === AudioPreview.Playing) return;

    if (phoneticText.length === 0) {
      setPhoneticText(visualText);
    }

    setAudioState(AudioPreview.Playing);
  };

  // Called after the audio preview plays in full
  const onAudioEnded = () => {
    setAudioState(AudioPreview.Reviewed);
  };

  const onAudioError = () => {
    setAudioState(AudioPreview.Outdated);
    onError("Error occurred while fetching audio preview. Please try again.");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (
      form.checkValidity() === false ||
      signIds.length === 0 ||
      audioState !== AudioPreview.Reviewed
    ) {
      onError("Correct the issue(s) noted above.");
      event.stopPropagation();
    } else {
      onSubmit();
    }

    setValidated(true);
  };

  if (hide) return null;

  const startDateTime = moment(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm");
  const endDateTime = moment(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm");

  return (
    <div className="new-pa-message-page">
      <Form onSubmit={handleSubmit} noValidate>
        <div className="header">{title}</div>
        <Container fluid>
          <NewPaMessageHeader
            associatedAlert={associatedAlert}
            onClearAssociatedAlert={onClearAssociatedAlert}
            navigateTo={navigateTo}
            setEndWithEffectPeriod={setEndWithEffectPeriod}
          />
          <Card className="when-card">
            <div className="title">When</div>
            <Row md="auto">
              <Form.Group className="start-datetime">
                <Form.Label
                  className="label body--regular"
                  htmlFor="start-date-picker"
                >
                  Start
                </Form.Label>
                <div className="datetime-picker-group">
                  <div className="validation-group">
                    <Form.Control
                      className="date-picker picker"
                      type="date"
                      id="start-date-picker"
                      name="start-date-picker-input"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      isInvalid={
                        validated && startDateTime.isSameOrAfter(endDateTime)
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      Start date/time needs to be before the end date/time
                    </Form.Control.Feedback>
                  </div>
                  <div className="validation-group">
                    <Form.Control
                      type="time"
                      className="time-picker picker"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      isInvalid={
                        validated && !moment(startTime, "HH:mm").isValid()
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      Start time needs to be in the correct format.
                    </Form.Control.Feedback>
                  </div>
                  <Button
                    className="service-time-link"
                    variant="link"
                    onClick={() => setStartTime("03:00")}
                  >
                    Start of service day
                  </Button>
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
                {associatedAlert && (
                  <Form.Switch
                    id="effect-period-switch"
                    className="effect-period-switch"
                    checked={endWithEffectPeriod}
                    label="At end of alert"
                    onChange={(event) => {
                      if (!event.target.checked) {
                        setEndTime(
                          moment(startTime, "HH:mm")
                            .add(1, "hour")
                            .format("HH:mm"),
                        );
                      }

                      setEndWithEffectPeriod(event.target.checked);
                    }}
                  />
                )}
                {!endWithEffectPeriod && (
                  <div className="datetime-picker-group">
                    <div className="validation-group">
                      <Form.Control
                        className="date-picker picker"
                        type="date"
                        id="end-date-picker"
                        name="end-date-picker-input"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        isInvalid={
                          validated && endDateTime.isSameOrBefore(moment())
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Date is in the past.
                      </Form.Control.Feedback>
                    </div>
                    <div className="validation-group">
                      <Form.Control
                        type="time"
                        className="time-picker picker"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                        isInvalid={
                          validated && !moment(endTime, "HH:mm").isValid()
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        End time needs to be in the correct format.
                      </Form.Control.Feedback>
                    </div>
                    <Button
                      className="service-time-link"
                      variant="link"
                      onClick={() => setEndTime("03:00")}
                    >
                      End of service day
                    </Button>
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
                  onSelectPriority={(priority) => {
                    setInterval(priorityToIntervalMap[priority]);
                    setPriority(priority);
                  }}
                />
              </Col>
              <Col>
                <IntervalPicker
                  interval={interval}
                  onChangeInterval={setInterval}
                  validated={validated}
                />
              </Col>
            </Row>
          </Card>
          <Card className="where-card">
            <div className="title">Where</div>
            <div className="select-stations-and-zones-button-group">
              {signIds.length > 0 && (
                <SelectedSignsByRouteTags
                  places={places}
                  value={signIds}
                  onChange={setSignIds}
                  busRoutes={busRoutes}
                  onTagClick={() => navigateTo(Page.STATIONS)}
                />
              )}
              <Button
                className="add-stations-zones-button"
                onClick={() => navigateTo(Page.STATIONS)}
              >
                <PlusLg width={12} height={12} /> Add Stations & Zones
              </Button>
            </div>
            {validated && signIds.length === 0 && (
              <div className="validation-error">
                Selecting location is required
              </div>
            )}
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
                    if (audioState !== AudioPreview.Unreviewed) {
                      setAudioState(AudioPreview.Outdated);
                    }
                  }}
                  label="Text"
                  maxLength={MAX_TEXT_LENGTH}
                  required
                  validationText={"Text cannot be blank"}
                  validated={validated}
                />
              </Col>
              <Col md="auto" className="copy-button-col">
                <Button
                  disabled={visualText.length === 0}
                  className="copy-text-button"
                  onClick={() => {
                    setPhoneticText(visualText);
                    if (audioState !== AudioPreview.Unreviewed) {
                      setAudioState(AudioPreview.Outdated);
                    }
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
                        if (audioState !== AudioPreview.Unreviewed) {
                          setAudioState(AudioPreview.Outdated);
                        }
                      }}
                      disabled={phoneticText.length === 0}
                      label="Phonetic Audio"
                      maxLength={MAX_TEXT_LENGTH}
                      validated={validated}
                    />
                    <ReviewAudioButton
                      audioState={audioState}
                      onClick={previewAudio}
                      validated={validated}
                    />
                  </>
                ) : (
                  <>
                    <div className="form-label">Phonetic Audio</div>
                    <Card className="review-audio-card">
                      <ReviewAudioButton
                        audioState={audioState}
                        disabled={visualText.length === 0}
                        onClick={previewAudio}
                        validated={validated}
                      />
                    </Card>
                  </>
                )}
                {audioState === AudioPreview.Playing && (
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
            <Button type="submit" className="submit-button button-primary">
              Submit
            </Button>
          </Row>
        </Container>
      </Form>
    </div>
  );
};

interface ReviewAudioButtonProps {
  audioState: AudioPreview;
  disabled?: boolean;
  onClick: () => void;
  validated: boolean;
}

const ReviewAudioButton = ({
  audioState,
  disabled,
  onClick,
  validated,
}: ReviewAudioButtonProps) => {
  const audioPlaying = audioState === AudioPreview.Playing;
  return audioState === AudioPreview.Reviewed ? (
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
      {validated || audioState === AudioPreview.Outdated ? (
        <ExclamationTriangleFill fill="#FFC107" height={16} />
      ) : (
        <VolumeUpFill height={16} />
      )}
      {audioPlaying ? "Reviewing audio" : "Review audio"}
    </Button>
  );
};

interface NewPaMessageHeaderProps {
  associatedAlert: AlertModel | string | null;
  navigateTo: (page: Page) => void;
  onClearAssociatedAlert: () => void;
  setEndWithEffectPeriod: (endWithEffectPeriod: boolean) => void;
}

const NewPaMessageHeader = ({
  associatedAlert,
  navigateTo,
  onClearAssociatedAlert,
  setEndWithEffectPeriod,
}: NewPaMessageHeaderProps) => {
  const formatActivePeriod = (activePeriods: ActivePeriod[]) => {
    const [start, end] = getAlertEarliestStartLatestEnd(activePeriods);
    return (
      <div className="effect-period">
        Alert effect period: {start} &ndash; {end}
      </div>
    );
  };

  return associatedAlert ? (
    <Row md="auto" className="align-items-center">
      <div className="associated-alert-header">
        Associated Alert: Alert ID{" "}
        {typeof associatedAlert === "string"
          ? associatedAlert
          : associatedAlert.id}
        <Button
          variant="link"
          onClick={() => {
            onClearAssociatedAlert();
          }}
        >
          Clear
        </Button>
        {typeof associatedAlert === "string" ? (
          <div className="alert-ended">
            Alert has ended and is no longer available.
          </div>
        ) : (
          formatActivePeriod(associatedAlert.active_period)
        )}
      </div>
    </Row>
  ) : (
    <>
      <Row md="auto" className="align-items-center unassociated-alert-header">
        <Button
          variant="link"
          className="pr-0 associate-alert-button"
          onClick={() => {
            setEndWithEffectPeriod(true);
            navigateTo(Page.ALERTS);
          }}
        >
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
    </>
  );
};

export default MainForm;
