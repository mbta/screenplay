import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Modal, Form } from "react-bootstrap";
import moment from "moment";
import FilterGroup from "Components/FilterGroup";
import { fetchActiveAndFutureAlerts } from "Utils/api";
import { Alert } from "Models/alert";
import { getAlertEarliestStartLatestEnd } from "../../../util";

interface AssociateAlertPageProps {
  onApply: (
    alert: Alert,
    endWithEffectPeriod: boolean,
    importLocations: boolean,
    importMessage: boolean,
  ) => void;
  onCancel: () => void;
}

const AssociateAlert = ({ onApply, onCancel }: AssociateAlertPageProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [endWithEffectPeriod, setEndWithEffectPeriod] = useState<boolean>(true);
  const [importLocations, setImportLocations] = useState<boolean>(true);
  const [importMessage, setImportMessage] = useState<boolean>(true);

  useEffect(() => {
    fetchActiveAndFutureAlerts().then(({ alerts: alerts }) => {
      setAlerts(alerts);
    });
  }, []);

  const [selectedMessageState, setSelectedMessageState] =
    useState<string>("active");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("All");

  const serviceTypes = [
    "All",
    "Green",
    "Red",
    "Orange",
    "Blue",
    "Mattapan",
    "Silver Line",
    "Bus",
  ];

  return (
    <div className="associate-alert-page">
      <Container fluid>
        <Row className="associate-alert-page-header">
          <Col>
            <h1>Select alert to associate with PA/ESS Message</h1>
          </Col>
          <Col className="associate-alert-page-header__cancel">
            <Button variant="link" onClick={() => onCancel()}>
              Cancel
            </Button>
          </Col>
        </Row>
        <Row className="associate-alert-page-body">
          <Col className="associate-alert-filter-selection">
            <FilterGroup
              className="mb-5"
              header="Message state"
              selectedFilter={selectedMessageState}
              onFilterSelect={setSelectedMessageState}
              filters={[
                { label: "Live", value: "active" },
                { label: "Future", value: "future" },
              ]}
            />
            <FilterGroup
              header="Service type"
              selectedFilter={selectedServiceType}
              onFilterSelect={setSelectedServiceType}
              filters={serviceTypes.map((serviceType) => {
                return { label: serviceType, value: serviceType };
              })}
            />
          </Col>
          <Col>
            <AssociateAlertsTable
              alerts={alerts}
              onSelectAlert={setSelectedAlert}
              messageStateFilter={selectedMessageState}
              serviceTypeFilter={selectedServiceType}
            />
          </Col>
        </Row>
      </Container>
      <Modal className="alert-items-modal" show={!!selectedAlert} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          onHide={() => setSelectedAlert(null)}
        >
          Select items from alert
        </Modal.Header>
        <Modal.Body>
          <div className="alert-description">
            <div className="alert-description__header">
              <div className="alert-description__header-id-label">
                Alert ID:{" "}
              </div>
              <div className="alert-description__header-id">
                {selectedAlert?.id}
              </div>
            </div>
            {selectedAlert?.header}
          </div>
          <div className="checkbox">
            <Form.Check
              id="effect-period-checkbox"
              label="End PA/ESS message at the end of alert effect period"
              checked={endWithEffectPeriod}
              onChange={() => setEndWithEffectPeriod(!endWithEffectPeriod)}
            />
          </div>
          <div className="checkbox">
            <Form.Check
              id="import-locations-checkbox"
              label="Import locations"
              checked={importLocations}
              onChange={() => setImportLocations(!importLocations)}
            />
            <div className="subtext">Locations will be editable</div>
          </div>
          <div className="checkbox">
            <Form.Check
              id="import-message-checkbox"
              label="Import message"
              checked={importMessage}
              onChange={() => {
                setImportMessage(!importMessage);
              }}
            />
            <div className="subtext">Message will be editable</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setSelectedAlert(null)}
            className="cancel-button"
            variant="link"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedAlert) {
                onApply(
                  selectedAlert,
                  endWithEffectPeriod,
                  importLocations,
                  importMessage,
                );
              }
            }}
            className="apply-button"
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

interface AssociateAlertsTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  messageStateFilter: string;
  serviceTypeFilter: string;
}

const AssociateAlertsTable = ({
  alerts,
  onSelectAlert,
  messageStateFilter,
  serviceTypeFilter,
}: AssociateAlertsTableProps) => {
  const filterByActiveState = (alert: Alert) => {
    const alertStart = new Date(alert.active_period[0].start);
    const currentTime = new Date();
    return messageStateFilter === "active"
      ? alertStart <= currentTime
      : alertStart > currentTime;
  };

  const filterByServiceType = (alert: Alert) => {
    return (
      serviceTypeFilter === "All" ||
      alert.affected_list.some((affected) =>
        affected.includes(serviceTypeFilter.toLowerCase()),
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    return filterByActiveState(alert) && filterByServiceType(alert);
  });

  return (
    <>
      <table className="associate-alert-table">
        <thead>
          <tr>
            <th className="associate-alert-table__message">Alert message</th>
            <th className="associate-alert-table__id">ID</th>
            <th className="associate-alert-table__start-end">Start-End</th>
            <th className="associate-alert-table__last-modified">
              Last modified
            </th>
            <th className="associate-alert-table__select"></th>
          </tr>
        </thead>
        <tbody>
          {filteredAlerts.length == 0 ? (
            <tr>
              <td className="associate-alert-table__empty">
                <div className="associate-alert-table__empty-text">
                  There are no alerts of this type
                </div>
              </td>
            </tr>
          ) : (
            filteredAlerts.map((alert: Alert) => {
              return (
                <AssociateAlertsTableRow
                  key={alert.id}
                  alert={alert}
                  onSelect={() => onSelectAlert(alert)}
                />
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
};

interface AssociateAlertsTableRowProps {
  alert: Alert;
  onSelect: () => void;
}

const AssociateAlertsTableRow = ({
  alert,
  onSelect,
}: AssociateAlertsTableRowProps) => {
  const [start, end] = getAlertEarliestStartLatestEnd(alert.active_period);

  const last_modified = moment(alert.updated_at).format("l LT");

  return (
    <tr className="associate-alert-table__row" onClick={() => onSelect()}>
      <td>{alert.header}</td>
      <td>{alert.id}</td>
      <td>
        {start}
        <br />
        {end}
      </td>
      <td>{last_modified}</td>
      <td className="associate-alert-table__select">
        <Button variant="link" onClick={() => onSelect()}>
          Select
        </Button>
      </td>
    </tr>
  );
};

export default AssociateAlert;
