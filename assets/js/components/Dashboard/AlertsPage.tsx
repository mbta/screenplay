import React, { ComponentType, useEffect, useState } from "react";
import FilterDropdown from "./FilterDropdown";
import { Col, Container, Row } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import "../../../css/screenplay.scss";
import {
  MODES_AND_LINES,
  SORT_LABELS,
  SCREEN_TYPES,
  STATUSES,
  SILVER_LINE_ROUTES,
} from "../../constants/constants";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { Screen } from "../../models/screen";
import { ScreensByAlert } from "../../models/screensByAlert";
import classNames from "classnames";
import AlertCard from "./AlertCard";

type DirectionID = 0 | 1;

interface AlertsResponse {
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

interface Props {
  places: Place[];
  isVisible: boolean;
}

const AlertsPage: ComponentType<Props> = (props: Props) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {}
  );
  useEffect(() => {
    if (!props.isVisible) return;

    fetch("/api/alerts")
      .then((response) => response.json())
      .then(({ alerts, screens_by_alert }: AlertsResponse) => {
        setAlerts(alerts);
        setScreensByAlertMap(screens_by_alert);
      });
  }, [props.isVisible]);

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

  const alertSortLabel = SORT_LABELS["Alerts"][alertSortDirection];

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
    if (alertScreenTypeFilterValue !== SCREEN_TYPES[0]) {
      filteredAlerts = filterAlertsByScreenType(
        filteredAlerts,
        alertScreenTypeFilterValue
      );
    }

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
      return alert.informed_entities.some((informedEntity) => {
        switch (label) {
          case "Commuter Rail":
            return informedEntity.route_type === 2;
          case "Bus":
            return (
              informedEntity.route_type === 3 &&
              !SILVER_LINE_ROUTES.includes(informedEntity.route as string)
            );
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

  // Get a mapping of screen ids => screen metadata (namely 'type') to use in filterAlertsByScreenType()
  const getScreenMetaDataById = () => {
    const screenMetaData: { [id: string]: Screen } = {};
    props.places.forEach((place) => {
      place.screens.forEach((screenData) => {
        screenMetaData[screenData.id] = screenData;
      });
    });
    return screenMetaData;
  };

  const screenMetaData = getScreenMetaDataById();

  const filterAlertsByScreenType = (
    alerts: Alert[],
    { ids }: { label: string; ids: string[] }
  ) => {
    return alerts.filter((alert) => {
      // Get this alert's list of affected screens.
      // Later should be replaced with a call to memcached?
      const screensWithAlert = screensByAlertMap[alert.id];

      return screensWithAlert
        ? screensWithAlert.find((screen_id) =>
            ids.includes(screenMetaData[screen_id].type)
          )
        : false;
    });
  };

  const compareAlerts = (
    { active_period: active_period_1 }: Alert,
    { active_period: active_period_2 }: Alert
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

  const getNumberOfAffectedPlaces = (screensByAlert: string[]) => {
    // Using a Set so we don't have to worry about counting a place more than once.
    const placesCounted = new Set();

    props.places.forEach((place) => {
      if (
        place.screens.filter((screen) => screensByAlert.includes(screen.id))
          .length > 0
      ) {
        placesCounted.add(place.id);
      }
    });

    return placesCounted.size;
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
                {alertSortLabel}
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
        {filterAlerts()
          .sort((a: Alert, b: Alert) =>
            alertSortDirection === 0 ? compareAlerts(a, b) : compareAlerts(b, a)
          )
          .map((alert: Alert) => {
            const screensByAlert = screensByAlertMap[alert.id];
            let numPlaces = 0;
            let numScreens = 0;

            if (screensByAlert) {
              numScreens = screensByAlert.length;
              numPlaces = getNumberOfAffectedPlaces(screensByAlert);
            }

            return (
              <AlertCard
                key={alert.id}
                alert={alert}
                numberOfScreens={numScreens}
                numberOfPlaces={numPlaces}
              />
            );
          })}
      </div>
    </div>
  );
};

export default AlertsPage;
