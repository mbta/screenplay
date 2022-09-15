import moment from "moment";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { ActivePeriod, Alert } from "../../models/alert";

interface AlertCardProps {
  alert: Alert;
}

const AlertCard = (props: AlertCardProps): JSX.Element => {
  const { alert } = props;

  const renderEffect = (effect: string, severity: string) => {
    if (effect.toLowerCase() === "delay") {
      //TODO Fix severity
      //TODO Translate effect
      return `${effect}—${severity}`;
    }

    return effect;
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
    <div className="alert-card">
      <Container fluid className="alert-card__alert-details">
        <Row>
          <Col lg="auto">Icon</Col>
          <Col lg={8}>
            <div className="alert-card__alert-details__effect">
              {renderEffect(alert.effect, alert.severity)}
            </div>
            <div className="alert-card__alert-details__header">
              {alert.header}
            </div>
          </Col>
          <Col lg="auto">
            <div className="alert-card__alert-details__active-period">
              {renderActivePeriod(alert.active_period)}
            </div>
          </Col>
        </Row>
      </Container>
      <div className="alert-card__place-details">
        <div className="alert-card__place-details__alert-id">ID {alert.id}</div>
        <div className="alert-card__place-details__place-count">
          <span className="alert-card__place-details__place-count__number">
            XX
          </span>{" "}
          <span className="alert-card__place-details__place-count__text">
            places
          </span>
        </div>
        <div className="alert-card__place-details__screen-count">
          <span className="alert-card__place-details__screen-count__number">
            XX
          </span>{" "}
          <span className="alert-card__place-details__screen-count__text">
            screens
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
