/* eslint-disable jsx-a11y/media-has-caption */
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { Page } from "./types";
import SelectedSignsByRouteTags from "./SelectedSignsByRouteTags";
import { Place } from "Models/place";

const MAX_TEXT_LENGTH = 2000;

enum AudioPreview {
  Unreviewed,
  Playing,
  Reviewed,
  Outdated,
}

interface Props {
  days: number[];
  startDateTime: Moment;
  setStartDateTime: (datetime: Moment) => void;
  endDateTime: Moment | null;
  setEndDateTime: (datetime: Moment | null) => void;
  interval: string;
  navigateTo: (page: Page) => void;
  phoneticText: string;
  priority: number;
  setDays: Dispatch<SetStateAction<number[]>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setInterval: Dispatch<SetStateAction<string>>;
  setPhoneticText: Dispatch<SetStateAction<string>>;
  setPriority: Dispatch<SetStateAction<number>>;
  setVisualText: Dispatch<SetStateAction<string>>;
  onClearAssociatedAlert: () => void;
  setEndWithEffectPeriod: Dispatch<SetStateAction<boolean>>;
  visualText: string;
  associatedAlert: AlertModel;
  endWithEffectPeriod: boolean;
  signIds: string[];
  setSignIds: (signIds: string[]) => void;
  places: Place[];
  busRoutes: string[];
}

const NewPaMessagePage = ({
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
  setErrorMessage,
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
}: Props) => {
  const now = moment();
  const navigate = useNavigate();
  const [audioState, setAudioState] = useState<AudioPreview>(
    AudioPreview.Unreviewed,
  );

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
    setErrorMessage(
      "Error occurred while fetching audio preview. Please try again.",
    );
  };

  useEffect(() => {
    setInterval(priorityToIntervalMap[priority]);
  }, [priority]);

  return (
    <div className="new-pa-message-page">
      <Form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="new-pa-message-page__header">New PA/ESS message</div>
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
                  />
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
                {associatedAlert.id && (
                  <Form.Switch
                    id="effect-period-switch"
                    className="effect-period-switch"
                    checked={endWithEffectPeriod}
                    label="At end of alert"
                    onChange={() => {
                      if (!endWithEffectPeriod) {
                        setEndDateTime(null);
                      } else {
                        setEndDateTime(moment(startDateTime).add(1, "hour"));
                      }

                      setEndWithEffectPeriod(!endWithEffectPeriod);
                    }}
                  />
                )}
                {!endWithEffectPeriod && endDateTime !== null && (
                  <div className="datetime-picker-group">
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
                    />
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
                    />
                    <ReviewAudioButton
                      audioState={audioState}
                      onClick={previewAudio}
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
}

const ReviewAudioButton = ({
  audioState,
  disabled,
  onClick,
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
      {audioState === AudioPreview.Outdated ? (
        <ExclamationTriangleFill fill="#FFC107" height={16} />
      ) : (
        <VolumeUpFill height={16} />
      )}
      {audioPlaying ? "Reviewing audio" : "Review audio"}
    </Button>
  );
};

interface NewPaMessageHeaderProps {
  associatedAlert: AlertModel;
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

  return associatedAlert.id ? (
    <Row md="auto" className="align-items-center">
      <div className="associated-alert-header">
        Associated Alert: Alert ID {associatedAlert.id}
        <Button
          variant="link"
          onClick={() => {
            onClearAssociatedAlert();
          }}
        >
          Clear
        </Button>
        {formatActivePeriod(associatedAlert.active_period)}
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

export default NewPaMessagePage;
