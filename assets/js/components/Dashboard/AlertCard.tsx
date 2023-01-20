import moment from "moment";
import React from "react";
import { Container, Fade } from "react-bootstrap";
import { ChevronRight } from "react-bootstrap-icons";
import { ActivePeriod, Alert } from "../../models/alert";
import classNames from "classnames";
import { formatEffect } from "../../util";
import { usePrevious } from "../../hooks/usePrevious";
import { useUpdateAnimation } from "../../hooks/useUpdateAnimation";

interface AlertCardProps {
  alert: Alert;
  numberOfScreens?: number;
  numberOfPlaces?: number;
  selectAlert?: () => void;
  classNames?: string;
  showAnimationOnMount?: boolean;
}

const AlertCard = (props: AlertCardProps): JSX.Element => {
  const { alert, numberOfPlaces, numberOfScreens, showAnimationOnMount } =
    props;
  const prevAlert = usePrevious(alert);

  const { showAnimation } = useUpdateAnimation(
    [
      alert.header,
      alert.active_period[0].start,
      numberOfPlaces,
      numberOfScreens,
    ],
    prevAlert,
    showAnimationOnMount
  );
  const isRecurring = alert.active_period.length > 1;

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
      <>
        {isRecurring && <div>Current effect period:</div>}
        <div className="alert-card__alert-details__active-period-start">
          {startDate.format("l")} · {startDate.format("LT")}
        </div>
      </>
    );

    if (activePeriod[0].end) {
      const endDate = moment(activePeriod[0].end);
      result = (
        <div className="alert-card__alert-details__active-period__range">
          {startDateHtml}
          <div className="alert-card__alert-details__active-period-end">
            <span className="alert-card__alert-details__active-period__to">
              to{" "}
            </span>
            <span>
              {endDate.format("l")} · {endDate.format("LT")}
            </span>
          </div>
        </div>
      );
    } else {
      result = (
        <div className="alert-card__alert-details__active-period__range">
          {startDateHtml}
          <div className="alert-card__alert-details__active-period-end">
            Until further notice
          </div>
        </div>
      );
    }

    return result;
  };

  return (
    <div className="alert-card-container">
      <Fade in={showAnimation}>
        <div className="update-animation"></div>
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
            {isRecurring && (
              <div className="alert-card__alert-details__active-period__recurring">
                Recurring alert
              </div>
            )}
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
                {numberOfPlaces == 1 ? "place" : "places"}
              </span>
            </div>
            <div className="alert-card__place-details__screen-count">
              <span className="alert-card__place-details__screen-count__number">
                {numberOfScreens}
              </span>{" "}
              <span className="alert-card__place-details__screen-count__text">
                {numberOfScreens == 1 ? "screen" : "screens"}
              </span>
            </div>
            <ChevronRight
              size={24}
              className="bootstrap-line-icon alert-card__place-details__icon"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AlertCard;
