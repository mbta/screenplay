/* eslint-disable jsx-a11y/media-has-caption */
import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import DaysPicker from "Components/DaysPicker";
import PriorityPicker from "Components/PriorityPicker";
import IntervalPicker from "Components/IntervalPicker";
import MessageTextBox from "Components/MessageTextBox";
import { useNavigate } from "react-router-dom";
import moment, { type Moment } from "moment";
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
import { StaticTemplate } from "Models/static_template";
import { MessageType } from "Models/pa_message";

const MAX_TEXT_LENGTH = 2000;

interface Props {
  title: string;
  days: number[];
  startDateTime: Moment;
  setStartDateTime: (datetime: Moment) => void;
  endDateTime: Moment;
  setEndDateTime: (datetime: Moment) => void;
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
  paused: boolean;
  selectedTemplate: StaticTemplate | null;
  onClearSelectedTemplate: () => void;
}

const MainForm = ({
  title,
  days,
  startDateTime,
  setStartDateTime,
  endDateTime,
  setEndDateTime,
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
  paused,
  selectedTemplate,
  onClearSelectedTemplate,
}: Props) => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

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

  return (
    <div className="new-pa-message-page">
      <Form onSubmit={handleSubmit} noValidate>
        <div className="header">
          {title}
          {paused && <div className="paused-pill">Paused</div>}
        </div>

        <Container fluid>
          <NewPaMessageHeader
            associatedAlert={associatedAlert}
            onClearAssociatedAlert={onClearAssociatedAlert}
            navigateTo={navigateTo}
            setEndWithEffectPeriod={setEndWithEffectPeriod}
            selectedTemplate={selectedTemplate}
            onClearSelectedTemplate={onClearSelectedTemplate}
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
                      value={startDateTime.format("YYYY-MM-DD")}
                      onChange={(event) =>
                        setStartDateTime(
                          moment(
                            `${event.target.value} ${startDateTime.format("HH:mm")}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                      }
                      isInvalid={
                        validated && startDateTime.isSameOrAfter(endDateTime)
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      Start date/time needs to be before the end date/time
                    </Form.Control.Feedback>
                  </div>
                  <Form.Control
                    type="time"
                    className="time-picker picker"
                    value={startDateTime.format("HH:mm")}
                    onChange={(event) =>
                      setStartDateTime(
                        moment(
                          `${startDateTime.format("YYYY-MM-DD")} ${event.target.value}`,
                          "YYYY-MM-DD HH:mm",
                        ),
                      )
                    }
                  />
                  <Button
                    className="service-time-link"
                    variant="link"
                    onClick={() =>
                      setStartDateTime(moment(startDateTime).hour(3).minute(0))
                    }
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
                        setEndDateTime(moment(startDateTime).add(1, "hour"));
                      }

                      setEndWithEffectPeriod(event.target.checked);
                    }}
                  />
                )}
                {!endWithEffectPeriod && endDateTime !== null && (
                  <div className="datetime-picker-group">
                    <div className="validation-group">
                      <Form.Control
                        className="date-picker picker"
                        type="date"
                        id="end-date-picker"
                        name="end-date-picker-input"
                        value={endDateTime.format("YYYY-MM-DD")}
                        onChange={(event) =>
                          setEndDateTime(
                            moment(
                              `${event.target.value} ${endDateTime.format("HH:mm")}`,
                              "YYYY-MM-DD HH:mm",
                            ),
                          )
                        }
                        isInvalid={
                          validated && endDateTime.isSameOrBefore(moment())
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Date is in the past.
                      </Form.Control.Feedback>
                    </div>
                    <Form.Control
                      type="time"
                      className="time-picker picker"
                      value={endDateTime.format("HH:mm")}
                      onChange={(event) =>
                        setEndDateTime(
                          moment(
                            `${endDateTime.format("YYYY-MM-DD")} ${event.target.value}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                      }
                    />
                    <Button
                      className="service-time-link"
                      variant="link"
                      onClick={() =>
                        setEndDateTime(moment(endDateTime).hour(3).minute(0))
                      }
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
                  onSelectPriority={setPriority}
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
                  disabled={selectedTemplate !== null}
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
                  disabled={
                    visualText.length === 0 || selectedTemplate !== null
                  }
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
                      disabled={
                        phoneticText.length === 0 || selectedTemplate !== null
                      }
                      label="Phonetic Audio"
                      maxLength={MAX_TEXT_LENGTH}
                      validated={validated}
                    />
                    {!selectedTemplate && (
                      <ReviewAudioButton
                        audioState={audioState}
                        onClick={previewAudio}
                        validated={validated}
                      />
                    )}
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
  selectedTemplate: StaticTemplate | null;
  onClearSelectedTemplate: () => void;
}

const NewPaMessageHeader = ({
  associatedAlert,
  navigateTo,
  onClearAssociatedAlert,
  setEndWithEffectPeriod,
  selectedTemplate,
  onClearSelectedTemplate,
}: NewPaMessageHeaderProps) => {
  const formatActivePeriod = (activePeriods: ActivePeriod[]) => {
    const [start, end] = getAlertEarliestStartLatestEnd(activePeriods);
    return (
      <div className="effect-period">
        Alert effect period: {start} &ndash; {end}
      </div>
    );
  };

  const formatMessageType = (messageType: MessageType) => {
    switch (messageType) {
      case "psa":
        return "PSA";
      case "emergency":
        return "Emergency";
      default:
        return "";
    }
  };

  let content;

  if (associatedAlert) {
    content = (
      <Row md="auto" className="align-items-center">
        <div className="associated-alert-header">
          Associated Alert: Alert ID{" "}
          {typeof associatedAlert === "string"
            ? associatedAlert
            : associatedAlert.id}
          <Button
            variant="link"
            onClick={onClearAssociatedAlert}
            className="clear-button"
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
    );
  } else if (selectedTemplate) {
    content = (
      <Row md="auto" className="align-items-center">
        <div className="selected-template-header">
          Template:{" "}
          {`${formatMessageType(selectedTemplate.type)} - ${selectedTemplate.title}`}
          <Button
            variant="link"
            onClick={onClearSelectedTemplate}
            className="clear-button"
          >
            Clear
          </Button>
        </div>
      </Row>
    );
  } else {
    content = (
      <Row md="auto" className="align-items-center alert-template-header">
        <div className="alert-template-container">
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
          |
          <Button
            variant="link"
            className="pr-0 psa-emergency-button"
            onClick={() => {
              navigateTo(Page.TEMPLATES);
            }}
          >
            Select PSA or Emergency template
          </Button>
          (Optional)
        </div>
      </Row>
    );
  }

  return content;
};

export default MainForm;
