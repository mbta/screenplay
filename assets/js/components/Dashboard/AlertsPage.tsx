import React, { ComponentType } from "react";
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
import AlertCard from "./AlertCard";
import { useNavigate } from "react-router-dom";
import { placesWithSelectedAlert } from "../../util";
import {
  useAlertsListContext,
  useAlertsListDispatchContext,
  useScreenplayContext,
} from "../../hooks/useScreenplayContext";
import { usePrevious } from "../../hooks/usePrevious";
import moment from "moment";

const AlertsPage: ComponentType = () => {
  const { places, alerts, screensByAlertMap } = useScreenplayContext();

  const alertsWithPlaces = alerts.filter(
    (alert) => screensByAlertMap[alert.id]
  );

  return (
    <div className="alerts-page">
      <div className="page-content__header">Posted Alerts</div>
      <div className="page-content__body">
        <AlertsList
          places={places}
          alerts={alertsWithPlaces}
          screensByAlertMap={screensByAlertMap}
        />
      </div>
    </div>
  );
};

interface AlertsListProps {
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
  places: Place[];
}

const AlertsList: ComponentType<AlertsListProps> = ({
  alerts,
  places,
  screensByAlertMap,
}: AlertsListProps) => {
  const {
    sortDirection,
    modeLineFilterValue,
    screenTypeFilterValue,
    statusFilterValue,
  } = useAlertsListContext();
  const dispatch = useAlertsListDispatchContext();
  const navigate = useNavigate();
  const prevAlertIds = usePrevious(alerts)?.map((alert) => alert.id);

  const alertSortLabel = SORT_LABELS["Alerts"][sortDirection];

  const sortLabelOnClick = () => {
    dispatch({
      type: "SET_SORT_DIRECTION",
      sortDirection: 1 - sortDirection,
    });
  };

  const handleAlertModeOrLineSelect = (value: string) => {
    const selectedFilter = MODES_AND_LINES.find(({ label }) => label === value);
    if (selectedFilter) {
      dispatch({
        type: "SET_MODE_LINE_FILTER",
        filterValue: selectedFilter,
      });
    }
  };

  const handleAlertScreenTypeSelect = (value: string) => {
    const selectedFilter = SCREEN_TYPES.find(({ label }) => label === value);
    if (selectedFilter) {
      dispatch({
        type: "SET_SCREEN_TYPE_FILTER",
        filterValue: selectedFilter,
      });
    }
  };

  const handleAlertStatusSelect = (value: string) => {
    const selectedFilter = STATUSES.find(({ label }) => label === value);
    if (selectedFilter) {
      dispatch({
        type: "SET_STATUS_FILTER",
        filterValue: selectedFilter,
      });
    }
  };

  const filterAlerts = () => {
    let filteredAlerts = alerts;
    if (screenTypeFilterValue !== SCREEN_TYPES[0]) {
      filteredAlerts = filterAlertsByScreenType(
        filteredAlerts,
        screenTypeFilterValue
      );
    }

    if (modeLineFilterValue !== MODES_AND_LINES[0]) {
      filteredAlerts = filterAlertsByModeOrLine(
        filteredAlerts,
        modeLineFilterValue
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
    places.forEach((place) => {
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
      const screensWithAlert = screensByAlertMap[alert.id];

      return screensWithAlert
        ? screensWithAlert.find((screen_id) =>
            ids.includes(screenMetaData[screen_id]?.type)
          )
        : false;
    });
  };

  const compareAlerts = (
    { active_period: active_period_1 }: Alert,
    { active_period: active_period_2 }: Alert
  ) => {
    // Get the soonest start time
    const start1 = moment(active_period_1[0].start);
    const start2 = moment(active_period_2[0].start);
    // Get the latest end time
    const end1 = moment(active_period_1[0].end);
    const end2 = moment(active_period_2[0].end);

    if (end1.isSame(end2)) {
      // Fall back to start time
      return start1.isBefore(start2) ? 1 : -1;
    } else if (!end1.isValid()) {
      return 1;
    } else if (!end2.isValid()) {
      return -1;
    } else {
      return end1.isBefore(end2) ? -1 : 1;
    }
  };

  return (
    <>
      <Container fluid>
        <Row className="filterable-list__header-row">
          <Col lg={3}>
            <div
              className="filterable-list__sort-label d-flex align-items-center"
              onClick={sortLabelOnClick}
              data-testid="sort-label"
            >
              {alertSortLabel}
              {sortDirection === 0 ? <ArrowDown /> : <ArrowUp />}
            </div>
          </Col>
          <Col lg={3} className="d-flex justify-content-end pe-3">
            <FilterDropdown
              list={MODES_AND_LINES}
              onSelect={(value: any) => handleAlertModeOrLineSelect(value)}
              selectedValue={modeLineFilterValue}
              className="modes-and-lines"
            />
          </Col>
          <Col lg={3} className="place-screen-types pe-3">
            <FilterDropdown
              list={SCREEN_TYPES}
              onSelect={(value: any) => handleAlertScreenTypeSelect(value)}
              selectedValue={screenTypeFilterValue}
              className="screen-types"
            />
          </Col>
          <Col lg={3}>
            <FilterDropdown
              list={STATUSES}
              onSelect={(value: any) => handleAlertStatusSelect(value)}
              selectedValue={statusFilterValue}
              className="statuses"
              disabled
            />
          </Col>
        </Row>
      </Container>
      {filterAlerts()
        .sort((a: Alert, b: Alert) =>
          sortDirection === 0 ? compareAlerts(a, b) : compareAlerts(b, a)
        )
        .map((alert: Alert) => {
          const screensByAlert = screensByAlertMap[alert.id];
          let numPlaces = 0;
          let numScreens = 0;

          if (screensByAlert) {
            numScreens = screensByAlert.length;
            numPlaces = placesWithSelectedAlert(
              alert,
              places,
              screensByAlertMap
            ).length;
          }

          let showAnimationOnMount = false;
          if (prevAlertIds?.length) {
            showAnimationOnMount = !prevAlertIds.includes(alert.id);
          }

          return (
            <AlertCard
              key={alert.id}
              alert={alert}
              selectAlert={() => {
                navigate(`/alerts/${alert.id}`);
              }}
              numberOfScreens={numScreens}
              numberOfPlaces={numPlaces}
              showAnimationOnMount={showAnimationOnMount}
            />
          );
        })}
    </>
  );
};

export default AlertsPage;
