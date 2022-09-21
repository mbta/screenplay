import React, { ComponentType, useState } from "react";
import FilterDropdown from "./FilterDropdown";
import { Col, Container, Row } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import {
  MODES_AND_LINES,
  SORT_LABELS,
  SCREEN_TYPES,
  STATUSES,
} from "../../constants/constants";
import { Alert } from "../../models/alert";
import classNames from "classnames";

type DirectionID = 0 | 1;

const getAlertSortLabel = (sortDirection: DirectionID) => {
  const sortLabels = SORT_LABELS["Alerts"];
  return sortLabels[sortDirection];
};

interface Props {
  alerts: Alert[];
  isVisible: boolean;
}

const AlertsPage: ComponentType<Props> = (props: Props) => {
  const [alertSortDirection, setAlertSortDirection] = useState<DirectionID>(0);
  const [alertModeLineFilterValue, setAlertModeLineFilterValue] = useState(
    MODES_AND_LINES[0]
  );
  const [alertScreenTypeFilterValue, setAlertScreenTypeFilterValue] = useState(
    SCREEN_TYPES[0]
  );
  const [alertStatusFilterValue, setAlertStatusFilterValue] = useState(
    STATUSES[0]
  );

  const alertSortLabel = getAlertSortLabel(alertSortDirection);
  const sortLabelOnClick = () => {
    setAlertSortDirection((1 - alertSortDirection) as DirectionID);
  };

  const handleAlertModeOrLineSelect = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter) {
      setAlertModeLineFilterValue(selectedFilter);
    }
  };

  const handleAlertScreenTypeSelect = (value: string) => {
    const selectedFilter = SCREEN_TYPES.find(({ label }) => label === value);
    if (selectedFilter) {
      setAlertScreenTypeFilterValue(selectedFilter);
    }
  };

  const handleAlertStatusSelect = (value: string) => {
    const selectedFilter = STATUSES.find(({ label }) => label === value);
    if (selectedFilter) {
      setAlertStatusFilterValue(selectedFilter);
    }
  };

  const filterAlerts = () => {
    let filteredAlerts = props.alerts;
    if (alertModeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredAlerts = filterAlertsByModeOrLine(
        filteredAlerts,
        alertModeLineFilterValue
      );
    }
    return filteredAlerts;
  };

  const filterAlertsByModeOrLine = (
    alerts: Alert[],
    { label, ids }: { label: string; ids: string[] }
  ) => {
    return alerts.filter((alert) => {
      return alert.attributes.informed_entity.some((informedEntity) => {
        switch (label) {
          case "Commuter Rail":
            return informedEntity.route_type === 2;
          case "Bus":
            return informedEntity.route_type === 3;
          case "Ferry":
            return informedEntity.route_type === 4;
          case "Access":
            return "facility" in informedEntity;
          default:
            return ids.includes(informedEntity.route as string);
        }
      });
    });
  };

  // const filterAlertsByScreenType = (alerts: Alert[]) => {};

  const sortAlerts = (alerts: Alert[]) => {
    alerts.sort((a: Alert, b: Alert) => {
      return alertSortDirection === 0
        ? compareAlerts(a, b)
        : compareAlerts(b, a);
    });
    return alerts;
  };

  const compareAlerts = (
    { attributes: { active_period: active_period_1 } }: Alert,
    { attributes: { active_period: active_period_2 } }: Alert
  ) => {
    // Get the soonest start time
    const { start: start1 } = active_period_1[0];
    const { start: start2 } = active_period_2[0];
    // Get the latest end time
    const { end: end1 } = active_period_1[active_period_1.length - 1];
    const { end: end2 } = active_period_2[active_period_2.length - 1];

    if (end1 === end2) {
      // Fall back to start time
      return Date.parse(start1) - Date.parse(start2);
    } else if (!end1) {
      return 1;
    } else if (!end2) {
      return -1;
    }
    return Date.parse(end1) - Date.parse(end2);
  };

  return (
    <div
      className={classNames("alerts-page", {
        "alerts-page--hidden": !props.isVisible,
      })}
    >
      <div className="page-content__header">Posted Alerts</div>
      <div className="page-content__body">
        <Container fluid>
          <Row className="place-list__header-row">
            <Col lg={3}>
              <div
                className="place-list__sort-label d-flex align-items-center"
                onClick={sortLabelOnClick}
                data-testid="sort-label"
              >
                {alertSortLabel}{" "}
                {alertSortDirection === 0 ? <ArrowDown /> : <ArrowUp />}
              </div>
            </Col>
            <Col lg={3} className="d-flex justify-content-end pe-3">
              <FilterDropdown
                list={MODES_AND_LINES}
                onSelect={(value: any) => handleAlertModeOrLineSelect(value)}
                selectedValue={alertModeLineFilterValue}
                className="modes-and-lines"
              />
            </Col>
            <Col lg={3} className="place-screen-types pe-3">
              <FilterDropdown
                list={SCREEN_TYPES}
                onSelect={(value: any) => handleAlertScreenTypeSelect(value)}
                selectedValue={alertScreenTypeFilterValue}
                className="screen-types"
              />
            </Col>
            <Col lg={3}>
              <FilterDropdown
                list={STATUSES}
                onSelect={(value: any) => handleAlertStatusSelect(value)}
                selectedValue={alertStatusFilterValue}
                className="statuses"
                disabled
              />
            </Col>
          </Row>
        </Container>
        {sortAlerts(filterAlerts()).map((alert: Alert) => (
          <div key={alert.id} style={{ color: "white" }} data-testid={alert.id}>
            id: {alert.id} {"End: "}
            {
              alert.attributes.active_period[
                alert.attributes.active_period.length - 1
              ].end
            }{" "}
            {"Start: "}
            {alert.attributes.active_period[0].start}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
