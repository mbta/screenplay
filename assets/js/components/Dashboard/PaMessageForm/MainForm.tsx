/* eslint-disable jsx-a11y/media-has-caption */
import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
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
import DaysPicker from "Components/DaysPicker";
import PriorityPicker from "Components/PriorityPicker";
import IntervalPicker from "Components/IntervalPicker";
import MessageTextBox from "Components/MessageTextBox";
import InfoPopover from "Components/InfoPopover";
import { ActivePeriod, Alert as AlertModel } from "Models/alert";
import { getAlertEarliestStartLatestEnd } from "../../../util";
import { AudioPreview, Page } from "./types";
import SelectedSignsByRouteTags from "./SelectedSignsByRouteTags";
import { Place } from "Models/place";
import * as paMessageStyles from "Styles/pa-messages.module.scss";
import { StaticTemplate } from "Models/static_template";
import { MessageType } from "Models/pa_message";

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
  audioURL: string;
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
  isReadOnly?: boolean;
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
  audioURL,
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
  isReadOnly = false,
}: Props) => {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

  const previewAudio = () => {
    if (audioState === AudioPreview.Playing) return;

    if (audioURL.length === 0 && phoneticText.length === 0) {
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
      days.length === 0 ||
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
  const popoverText = "The service day starts and ends at 4:00 AM";

  const isEndTimeInvalid = validated && !moment(endTime, "HH:mm").isValid();

  return (
    <div className={paMessageStyles.editPage}>
      <Form onSubmit={handleSubmit} noValidate className="m-0">
        <h1>
          {title}
          {paused && (
            <span className={cx(paMessageStyles.pausedPill, "ms-3")}>
              Paused
            </span>
          )}
        </h1>

        <NewPaMessageHeader
          associatedAlert={associatedAlert}
          onClearAssociatedAlert={onClearAssociatedAlert}
          navigateTo={navigateTo}
          selectedTemplate={selectedTemplate}
          onClearSelectedTemplate={onClearSelectedTemplate}
          isReadOnly={isReadOnly}
        />
        <Card className={paMessageStyles.card}>
          <div className={paMessageStyles.cardTitle}>When</div>
          <Form.Group>
            <Form.Label
              className={paMessageStyles.formLabel}
              htmlFor="start-date-picker"
            >
              Start
            </Form.Label>
            <div className="d-flex gap-3 align-items-center">
              <div className={paMessageStyles.startEndItem}>
                <Form.Control
                  className={cx(paMessageStyles.inputField, "picker")}
                  type="date"
                  id="start-date-picker"
                  name="start-date-picker-input"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  isInvalid={
                    validated &&
                    ((moment(startTime, "HH:mm").isValid() &&
                      startDateTime.isSameOrAfter(endDateTime)) ||
                      !moment(startDate, "YYYY-MM-DD").isValid())
                  }
                  disabled={isReadOnly}
                />
                {moment(startDate, "YYYY-MM-DD").isValid() ? (
                  <Form.Control.Feedback type="invalid">
                    Start date/time needs to be before the end date/time
                  </Form.Control.Feedback>
                ) : (
                  <Form.Control.Feedback type="invalid">
                    Date needs to be in the correct format
                  </Form.Control.Feedback>
                )}
              </div>
              <div className={paMessageStyles.startEndItem}>
                <Form.Control
                  type="time"
                  className={cx(paMessageStyles.inputField, "picker")}
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  isInvalid={validated && !moment(startTime, "HH:mm").isValid()}
                  disabled={isReadOnly}
                />
                <Form.Control.Feedback type="invalid">
                  Start time needs to be in the correct format
                </Form.Control.Feedback>
              </div>
              {!isReadOnly && (
                <div className={paMessageStyles.startEndItem}>
                  <Button
                    className={paMessageStyles.serviceTimeButton}
                    variant="link"
                    onClick={() => setStartTime("04:00")}
                  >
                    Start of service day
                  </Button>
                  <InfoPopover placement="top" popoverText={popoverText} />
                </div>
              )}
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label
              className={paMessageStyles.formLabel}
              htmlFor="end-date-picker"
            >
              End
            </Form.Label>
            {associatedAlert && (
              <Form.Switch
                id="effect-period-switch"
                className={cx("mb-2", paMessageStyles.switch)}
                checked={endWithEffectPeriod}
                label="At end of alert"
                onChange={(event) => {
                  if (!event.target.checked) {
                    setEndTime(
                      moment(startTime, "HH:mm").add(1, "hour").format("HH:mm"),
                    );
                  }

                  setEndWithEffectPeriod(event.target.checked);
                }}
                disabled={isReadOnly}
              />
            )}
            {!endWithEffectPeriod && (
              <div className="d-flex gap-3 align-items-center">
                <div className={paMessageStyles.startEndItem}>
                  <Form.Control
                    className={cx(paMessageStyles.inputField, "picker")}
                    type="date"
                    id="end-date-picker"
                    name="end-date-picker-input"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    isInvalid={
                      validated &&
                      ((moment(endTime, "HH:mm").isValid() &&
                        endDateTime.isSameOrBefore(moment())) ||
                        !moment(endDate, "YYYY-MM-DD").isValid())
                    }
                    disabled={isReadOnly}
                  />
                  {moment(endDate, "YYYY-MM-DD").isValid() ? (
                    <Form.Control.Feedback type="invalid">
                      Date is in the past
                    </Form.Control.Feedback>
                  ) : (
                    <Form.Control.Feedback type="invalid">
                      Date needs to be in the correct format
                    </Form.Control.Feedback>
                  )}
                </div>
                <div className={paMessageStyles.startEndItem}>
                  <Form.Control
                    type="time"
                    className={cx(paMessageStyles.inputField, "picker")}
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    isInvalid={isEndTimeInvalid}
                    disabled={isReadOnly}
                  />
                  <Form.Control.Feedback type="invalid">
                    End time needs to be in the correct format
                  </Form.Control.Feedback>
                </div>
                {!isReadOnly && (
                  <div className={paMessageStyles.startEndItem}>
                    <Button
                      className={paMessageStyles.serviceTimeButton}
                      variant="link"
                      onClick={() => {
                        if (isEndTimeInvalid) return;

                        if (moment(endTime, "HH:mm").hour() >= 4) {
                          setEndDate(
                            moment(endDate, "YYYY-MM-DD")
                              .add(1, "d")
                              .format("YYYY-MM-DD"),
                          );
                        }

                        setEndTime("04:00");
                      }}
                    >
                      End of service day
                    </Button>
                    <InfoPopover placement="top" popoverText={popoverText} />
                  </div>
                )}
              </div>
            )}
          </Form.Group>
          <DaysPicker
            days={days}
            onChangeDays={setDays}
            error={validated && !days.length ? "Select at least one day" : null}
            disabled={isReadOnly}
          />
          <div className="d-flex gap-4">
            <PriorityPicker
              priority={priority}
              onSelectPriority={setPriority}
              disabled={isReadOnly}
            />
            <IntervalPicker
              interval={interval}
              onChangeInterval={setInterval}
              validated={validated}
              disabled={isReadOnly}
            />
          </div>
        </Card>
        <Card className={paMessageStyles.card}>
          <div className={paMessageStyles.cardTitle}>Where</div>
          <div className="d-flex flex-wrap gap-2">
            {signIds.length > 0 && (
              <SelectedSignsByRouteTags
                places={places}
                value={signIds}
                onChange={setSignIds}
                busRoutes={busRoutes}
                onTagClick={() => navigateTo(Page.STATIONS)}
                isReadOnly={isReadOnly}
              />
            )}
            {!isReadOnly && (
              <Button
                className={paMessageStyles.addStationsZonesButton}
                onClick={() => navigateTo(Page.STATIONS)}
              >
                <PlusLg width={12} height={12} /> Add Stations & Zones
              </Button>
            )}
          </div>
          {validated && signIds.length === 0 && (
            <div className="validation-error">
              Selecting location is required
            </div>
          )}
        </Card>
        <Card className={paMessageStyles.card}>
          <div className={paMessageStyles.cardTitle}>Message</div>
          {audioURL.length === 0 ? (
            <div className="d-flex gap-4">
              <div style={{ flex: 1 }}>
                <MessageTextBox
                  id="visual-text-box"
                  text={visualText}
                  disabled={selectedTemplate !== null || isReadOnly}
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
              </div>
              <div className={paMessageStyles.copyButtonCol}>
                <Button
                  disabled={
                    visualText.length === 0 ||
                    selectedTemplate !== null ||
                    isReadOnly
                  }
                  className={paMessageStyles.copyTextButton}
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
              </div>
              <div style={{ flex: 1 }}>
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
                      disabled={selectedTemplate !== null || isReadOnly}
                      className="mb-2"
                      label="Phonetic Audio"
                      maxLength={MAX_TEXT_LENGTH}
                      validated={validated}
                    />
                    {
                      <ReviewAudioButton
                        audioState={audioState}
                        onClick={previewAudio}
                        validated={validated}
                      />
                    }
                  </>
                ) : (
                  <>
                    <div className="form-label">Phonetic Audio</div>
                    <Card className={paMessageStyles.reviewAudioCard}>
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
              </div>
            </div>
          ) : (
            <div className="container-fluid gap-4">
              <MessageTextBox
                className="mb-2"
                id="visual-text-box"
                text={visualText}
                disabled
                onChangeText={(_) => {}}
                maxLength={MAX_TEXT_LENGTH}
                label="Text"
                required
                validationText={"Text cannot be blank"}
                validated={validated}
              />
              <ReviewAudioButton
                audioState={audioState}
                onClick={previewAudio}
                validated={validated}
              />
              {audioState === AudioPreview.Playing && (
                <audio
                  src={`/api/pa-messages/preview_audio?audioUrl=${audioURL}`}
                  autoPlay
                  onEnded={onAudioEnded}
                  onError={onAudioError}
                />
              )}
            </div>
          )}
        </Card>
        <div className="d-flex justify-content-end gap-3 mt-3">
          <Button
            variant={isReadOnly ? "primary" : "link"}
            className={cx(paMessageStyles.formButton, {
              [paMessageStyles.transparentButton]: !isReadOnly,
            })}
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : window.close()
            }
          >
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button
              type="submit"
              className={cx(
                "submit-button button-primary",
                paMessageStyles.formButton,
              )}
            >
              Submit
            </Button>
          )}
        </div>
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
    <div className={paMessageStyles.audioReviewedText}>
      <span className="align-middle me-3">
        <CheckCircleFill /> Audio reviewed
      </span>
      <Button
        className={paMessageStyles.reviewAudioButton}
        onClick={onClick}
        variant="link"
      >
        Replay
      </Button>
    </div>
  ) : (
    <Button
      disabled={!audioPlaying && disabled}
      className={cx(paMessageStyles.reviewAudioButton, {
        [paMessageStyles.playing]: audioPlaying,
      })}
      variant="link"
      onClick={onClick}
    >
      {validated || audioState === AudioPreview.Outdated ? (
        <ExclamationTriangleFill className="me-2" fill="#FFC107" height={16} />
      ) : (
        <VolumeUpFill className="me-2" height={16} />
      )}
      {audioPlaying ? "Reviewing audio" : "Review audio"}
    </Button>
  );
};

interface NewPaMessageHeaderProps {
  associatedAlert: AlertModel | string | null;
  navigateTo: (page: Page) => void;
  onClearAssociatedAlert: () => void;
  selectedTemplate: StaticTemplate | null;
  onClearSelectedTemplate: () => void;
  isReadOnly: boolean;
}

const NewPaMessageHeader = ({
  associatedAlert,
  navigateTo,
  onClearAssociatedAlert,
  selectedTemplate,
  onClearSelectedTemplate,
  isReadOnly,
}: NewPaMessageHeaderProps) => {
  const formatActivePeriod = (activePeriods: ActivePeriod[]) => {
    const [start, end] = getAlertEarliestStartLatestEnd(activePeriods);
    return (
      <div className={cx("mt-1", paMessageStyles.smaller)}>
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

  if (associatedAlert) {
    return (
      <div className={paMessageStyles.alertHeader}>
        <div className="d-flex align-items-center">
          <span className={paMessageStyles.larger}>
            Associated Alert: Alert ID{" "}
            {typeof associatedAlert === "string"
              ? associatedAlert
              : associatedAlert.id}
          </span>
          {!isReadOnly && (
            <Button
              variant="link"
              className={paMessageStyles.clearAlertButton}
              onClick={() => {
                onClearAssociatedAlert();
              }}
            >
              Clear
            </Button>
          )}
        </div>
        {typeof associatedAlert === "string" ? (
          <div className={cx("mt-1", paMessageStyles.alertEndedText)}>
            Alert has ended and is no longer available.
          </div>
        ) : (
          formatActivePeriod(associatedAlert.active_period)
        )}
      </div>
    );
  } else if (selectedTemplate) {
    return (
      <div
        className={cx("d-flex align-items-center", paMessageStyles.alertHeader)}
      >
        <span className={paMessageStyles.larger}>
          Template: {formatMessageType(selectedTemplate.type)} -{" "}
          {selectedTemplate.title}
        </span>
        {!isReadOnly && (
          <Button
            variant="link"
            onClick={onClearSelectedTemplate}
            className={paMessageStyles.clearAlertButton}
          >
            Clear
          </Button>
        )}
      </div>
    );
  } else {
    return (
      <div
        className={cx("d-flex align-items-center", paMessageStyles.alertHeader)}
      >
        {!isReadOnly && (
          <>
            <Button
              variant="link"
              className={cx("ps-0", paMessageStyles.associateButton)}
              onClick={() => {
                navigateTo(Page.ALERTS);
              }}
            >
              Associate with alert
            </Button>
            <span className={paMessageStyles.larger}>|</span>
            <Button
              variant="link"
              className={paMessageStyles.associateButton}
              onClick={() => {
                navigateTo(Page.TEMPLATES);
              }}
            >
              Select PSA or Emergency template
            </Button>
            <span className={paMessageStyles.larger}>(Optional)</span>
          </>
        )}
      </div>
    );
  }
};

export default MainForm;
