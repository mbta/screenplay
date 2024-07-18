/* eslint-disable jsx-a11y/media-has-caption */
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import DaysPicker from "Components/DaysPicker";
import PriorityPicker from "Components/PriorityPicker";
import IntervalPicker from "Components/IntervalPicker";
import MessageTextBox from "Components/MessageTextBox";
import { useNavigate } from "react-router-dom";
import DatePicker from "Components/DatePicker";
import TimePicker from "Components/TimePicker";
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
import moment from "moment";

import { Page } from "./types";

const MAX_TEXT_LENGTH = 2000;

enum AudioPreview {
  Unreviewed,
  Playing,
  Reviewed,
  Outdated,
}

interface Props {
  days: number[];
  endDate: string;
  endTime: string;
  errorMessage: string;
  interval: string;
  navigateTo: (page: Page) => void;
  phoneticText: string;
  priority: number;
  setDays: Dispatch<SetStateAction<number[]>>;
  setEndDate: Dispatch<SetStateAction<string>>;
  setEndTime: Dispatch<SetStateAction<string>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setInterval: Dispatch<SetStateAction<string>>;
  setPhoneticText: Dispatch<SetStateAction<string>>;
  setPriority: Dispatch<SetStateAction<number>>;
  setStartDate: Dispatch<SetStateAction<string>>;
  setStartTime: Dispatch<SetStateAction<string>>;
  setVisualText: Dispatch<SetStateAction<string>>;
  setAssociatedAlert: Dispatch<SetStateAction<AlertModel>>;
  setEndWithEffectPeriod: Dispatch<SetStateAction<boolean>>;
  setImportMessage: Dispatch<SetStateAction<boolean>>;
  setImportLocations: Dispatch<SetStateAction<boolean>>;
  startDate: string;
  startTime: string;
  visualText: string;
  associatedAlert: AlertModel;
  endWithEffectPeriod: boolean;
}

const NewPaMessagePage = ({
  days,
  endDate,
  endTime,
  errorMessage,
  interval,
  navigateTo,
  phoneticText,
  priority,
  setDays,
  setEndDate,
  setEndTime,
  setErrorMessage,
  setInterval,
  setPhoneticText,
  setPriority,
  setStartDate,
  setStartTime,
  setVisualText,
  setEndWithEffectPeriod,
  setAssociatedAlert,
  setImportMessage,
  setImportLocations,
  startDate,
  startTime,
  visualText,
  associatedAlert,
  endWithEffectPeriod,
}: Props) => {
  const now = moment();
  const navigate = useNavigate();
  const [audioState, setAudioState] = useState<AudioPreview>(
    AudioPreview.Unreviewed,
  );
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
            visualText={visualText}
            phoneticText={phoneticText}
            setImportLocations={setImportLocations}
            setImportMessage={setImportMessage}
            setEndWithEffectPeriod={setEndWithEffectPeriod}
            setAssociatedAlert={setAssociatedAlert}
            setEndDate={setEndDate}
            setEndTime={setEndTime}
            setVisualText={setVisualText}
            setPhoneticText={setPhoneticText}
            navigateTo={navigateTo}
          />
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
                  <Form.Switch
                    id="effect-period-switch"
                    className="effect-period-switch"
                    checked={endWithEffectPeriod}
                    label="At end of alert"
                    onChange={() => {
                      if (!endWithEffectPeriod) {
                        setEndDate("");
                        setEndTime("");
                      } else {
                        setEndDate(now.format("L"));
                        setEndTime(now.add(1, "hour").format("HH:mm"));
                      }

                      setEndWithEffectPeriod(!endWithEffectPeriod);
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
            <Button
              className="add-stations-zones-button"
              onClick={() => navigateTo(Page.STATIONS)}
            >
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
  visualText: string;
  phoneticText: string;
  navigateTo: (page: Page) => void;
  setImportMessage: Dispatch<SetStateAction<boolean>>;
  setImportLocations: Dispatch<SetStateAction<boolean>>;
  setEndWithEffectPeriod: Dispatch<SetStateAction<boolean>>;
  setAssociatedAlert: Dispatch<SetStateAction<AlertModel>>;
  setVisualText: Dispatch<SetStateAction<string>>;
  setPhoneticText: Dispatch<SetStateAction<string>>;
  setEndDate: Dispatch<SetStateAction<string>>;
  setEndTime: Dispatch<SetStateAction<string>>;
}

const NewPaMessageHeader = ({
  associatedAlert,
  navigateTo,
  setImportMessage,
  setImportLocations,
  setEndWithEffectPeriod,
  setAssociatedAlert,
  setVisualText,
  setPhoneticText,
  setEndDate,
  setEndTime,
}: NewPaMessageHeaderProps) => {
  const now = moment();
  const formatActivePeriod = (activePeriods: ActivePeriod[]) => {
    const [start, end] = getAlertEarliestStartLatestEnd(activePeriods);
    return (
      <div className="affect-period">
        Alert Effect period: {start} - {end}
      </div>
    );
  };

  return (
    <>
      <Row md="auto" className="align-items-center">
        {associatedAlert.id ? (
          <div className="associated-alert-header">
            Associated Alert: Alert ID {associatedAlert.id}
            <Button variant="link" onClick={() => navigateTo(Page.ALERTS)}>
              Edit
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setAssociatedAlert({} as AlertModel);
                setVisualText("");
                setPhoneticText("");
                setEndWithEffectPeriod(false);
                setImportLocations(false);
                setImportMessage(false);
                setEndDate(now.format("L"));
                setEndTime(now.add(1, "hour").format("HH:mm"));
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
              onClick={() => navigateTo(Page.ALERTS)}
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
    </>
  );
};

export default NewPaMessagePage;
