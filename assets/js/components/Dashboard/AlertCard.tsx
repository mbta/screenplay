import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Container, Fade } from "react-bootstrap";
import { ChevronRight } from "react-bootstrap-icons";
import { ActivePeriod, Alert } from "../../models/alert";
import classNames from "classnames";
import { formatEffect } from "../../util";

interface AlertCardProps {
  alert: Alert;
  numberOfScreens?: number;
  numberOfPlaces?: number;
  selectAlert?: () => void;
  classNames?: string;
}

const AlertCard = (props: AlertCardProps): JSX.Element => {
  const { alert, numberOfPlaces, numberOfScreens } = props;
  const [showAnimation, setShowAnimation] = useState(false);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 2000);
  }, [
    alert.header,
    JSON.stringify(alert.active_period),
    numberOfPlaces,
    numberOfScreens,
  ]);

  const renderEffect = (effect: string, severity: string) => {
    const formattedEffect = formatEffect(effect);
    if (formattedEffect === "Delay") {
      return `${formattedEffect}—${severity}`;
    }

    return formattedEffect;
  };

  const renderActivePeriod = (activePeriod: ActivePeriod[]) => {
    const startDate = moment(activePeriod[0].start);
    let result;

    const startDateHtml = (
      <div className="alert-card__alert-details__active-period-start">
        {startDate.format("l")} · {startDate.format("LT")}
      </div>
    );

    if (activePeriod[0].end) {
      const endDate = moment(activePeriod[0].end);
      result = (
        <>
          {startDateHtml}
          <div className="alert-card__alert-details__active-period-end">
            <span className="alert-card__alert-details__active-period__to">
              to{" "}
            </span>
            <span>
              {endDate.format("l")} · {endDate.format("LT")}
            </span>
          </div>
        </>
      );
    } else {
      result = (
        <>
          {startDateHtml}
          <div className="alert-card__alert-details__active-period-end">
            Until further notice
          </div>
        </>
      );
    }

    return result;
  };

  return (
    <div style={{ position: "relative" }}>
      <Fade in={showAnimation}>
        <div className="showAnimation"></div>
      </Fade>
      <div
        className={classNames("alert-card", {
          selected: !props.selectAlert,
        })}
        data-testid={alert.id}
        onClick={props.selectAlert ? props.selectAlert : undefined}
      >
        <Container fluid className="alert-card__alert-details">
          <div className="alert-card__alert-details__pill-container">
            {alert.affected_list.map((icon: string) => (
              <img
                className="alert-card__alert-details__pill"
                key={`${alert.id}-${icon}`}
                src={`/images/pills/${icon.toLowerCase()}.svg`}
                alt={icon}
              />
            ))}
          </div>
          <div className="alert-card__alert-details__main-body">
            <div className="alert-card__alert-details__effect">
              {renderEffect(alert.effect, alert.severity_string)}
            </div>
            <div className="alert-card__alert-details__header">
              {alert.header}
            </div>
          </div>
          <div className="alert-card__alert-details__active-period">
            {renderActivePeriod(alert.active_period)}
          </div>
        </Container>
        {props.selectAlert ? (
          <div className="alert-card__place-details">
            <div className="alert-card__place-details__alert-id">
              ID {alert.id}
            </div>
            <div className="alert-card__place-details__place-count">
              <span className="alert-card__place-details__place-count__number">
                {numberOfPlaces}
              </span>{" "}
              <span className="alert-card__place-details__place-count__text">
                places
              </span>
            </div>
            <div className="alert-card__place-details__screen-count">
              <span className="alert-card__place-details__screen-count__number">
                {numberOfScreens}
              </span>{" "}
              <span className="alert-card__place-details__screen-count__text">
                screens
              </span>
            </div>
            <ChevronRight className="alert-card__place-details__icon" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AlertCard;
