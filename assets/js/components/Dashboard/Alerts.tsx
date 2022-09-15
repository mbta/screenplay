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

const getAlertSortLabel = (sortDirection: DirectionID) => {
  const sortLabels = SORT_LABELS["Alerts"];
  return sortLabels[sortDirection];
};

const Alerts = (): JSX.Element => {
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

  const sortAlerts = () => {};

  return (
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
  );
};

export default Alerts;
