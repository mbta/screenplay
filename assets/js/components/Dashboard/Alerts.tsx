import React, { useState } from "react";
import FilterDropdown from "./FilterDropdown";
import { Col, Container, Row } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import {
  MODES_AND_LINES,
  SORT_LABELS,
  SCREEN_TYPES,
  STATUSES,
  DirectionID,
} from "../../constants/constants";
import { Alert } from "../../models/alert";

const getAlertSortLabel = (sortDirection: DirectionID) => {
  const sortLabels = SORT_LABELS["Alerts"];
  return sortLabels[sortDirection];
};

const Alerts = (): JSX.Element => {
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts);
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
    let filteredAlerts = alerts;
    if (alertModeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredAlerts = filteredAlerts.filter((alert) => {
        return alert.attributes.informed_entity.some((informedEntity) => {
          switch (alertModeLineFilterValue.label) {
            case "Commuter Rail":
              return informedEntity.route_type === 2;
            case "Bus":
              return informedEntity.route_type === 3;
            case "Ferry":
              return informedEntity.route_type === 4;
            default:
              return alertModeLineFilterValue.ids.includes(
                informedEntity.route
              );
          }
        });
      });
    }
    return filteredAlerts;
  };

  const sortAlerts = (alerts: Alert[]) => {
    alerts.sort((a: Alert, b: Alert) => {
      return compareAlerts(a, b, alertSortDirection);
    });
    return alerts;
  };

  const compareAlerts = (a: Alert, b: Alert, sortDirection: DirectionID) => {
    const active_period_a = a.attributes.active_period;
    const active_period_b = b.attributes.active_period;
    // Get the soonest start time
    const { start: startA } = active_period_a[0];
    const { start: startB } = active_period_b[0];
    // Get the latest end time
    const { end: endA } = active_period_a[active_period_a.length - 1];
    const { end: endB } = active_period_b[active_period_b.length - 1];

    if (sortDirection == 0) {
      // Sort as soonest end first
      if (endA === endB) {
        // Fall back to soonest start first
        return Date.parse(startA) > Date.parse(startB) ? 1 : -1;
      } else if (!endA) {
        // A sorts after B
        return 1;
      } else if (!endB) {
        // A sorts before B
        return -1;
      }
      return Date.parse(endA) > Date.parse(endB) ? 1 : -1;
    } else {
      // Sort as soonest end last
      if (endA === endB) {
        // Fall back to soonest start last
        return Date.parse(startA) > Date.parse(startB) ? -1 : 1;
      } else if (!endA) {
        // A sorts before B
        return -1;
      } else if (!endB) {
        // A sorts after B
        return 1;
      }
      return Date.parse(endA) > Date.parse(endB) ? -1 : 1;
    }
  };

  return (
    <>
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
        <div key={alert.id} style={{ color: "white" }}>
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
    </>
  );
};

const sampleAlerts: Alert[] = [
  {
    id: "1",
    attributes: {
      active_period: [
        {
          end: "2022-10-29T02:30:00-04:00",
          start: "2022-08-28T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Orange",
          route_type: 1,
        },
      ],
    },
  },
  {
    id: "2",
    attributes: {
      active_period: [
        {
          end: "2022-10-30T02:30:00-04:00",
          start: "2022-08-28T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Red",
          route_type: 1,
        },
        {
          route: "Mattapan",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "3",
    attributes: {
      active_period: [
        {
          end: "2022-10-28T02:30:00-04:00",
          start: "2022-08-27T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Blue",
          route_type: 1,
        },
      ],
    },
  },
  {
    id: "4",
    attributes: {
      active_period: [
        {
          end: "2022-10-28T02:30:00-04:00",
          start: "2022-08-27T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-B",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "5",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-08-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-C",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "6",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-07-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-D",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "7",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-09-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-E",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "8",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-09-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
        {
          end: "2022-09-25T02:30:00-04:00",
          start: "2022-09-24T23:00:00-04:00",
        },
        {
          end: "2022-09-26T02:30:00-04:00",
          start: "2022-09-25T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-B",
          route_type: 0,
        },
        {
          route: "Green-C",
          route_type: 0,
        },
        {
          route: "Green-D",
          route_type: 0,
        },
        {
          route: "Green-E",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "9",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-09-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Orange",
          route_type: 1,
        },
        {
          route: "CR-something",
          route_type: 2,
        },
      ],
    },
  },
  {
    id: "10",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-08-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Red",
          route_type: 1,
        },
        {
          route: "100",
          route_type: 3,
        },
      ],
    },
  },
];

export default Alerts;
