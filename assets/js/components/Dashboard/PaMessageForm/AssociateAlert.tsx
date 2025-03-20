import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { fetchActiveAndFutureAlerts } from "Utils/api";
import { Alert } from "Models/alert";
import MessageTable from "../../Tables/MessageTable";
import AssociateAlertsRow from "../../Tables/Rows/AssociateAlertRow";
import { RadioList, RadioItem } from "Components/RadioList";

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

  const filterByActiveState = (alert: Alert, messageStateFilter: string) => {
    const alertStart = new Date(alert.active_period[0].start);
    const currentTime = new Date();
    return messageStateFilter === "active"
      ? alertStart <= currentTime
      : alertStart > currentTime;
  };

  const filterByServiceType = (alert: Alert, serviceTypeFilter: string) => {
    return (
      serviceTypeFilter === "All" ||
      alert.affected_list.some((affected) =>
        affected.includes(serviceTypeFilter.toLowerCase()),
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    return (
      filterByActiveState(alert, selectedMessageState) &&
      filterByServiceType(alert, selectedServiceType)
    );
  });

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
            <div className="mb-2">Filter by message state</div>
            <RadioList
              className="mb-5"
              value={selectedMessageState}
              onChange={setSelectedMessageState}
            >
              <RadioItem value="active">Live</RadioItem>
              <RadioItem value="future">Future</RadioItem>
            </RadioList>
            <div className="mb-2">Filter by service type</div>
            <RadioList
              value={selectedServiceType}
              onChange={setSelectedServiceType}
            >
              <RadioItem value="All">All</RadioItem>
              <RadioItem value="Green">Green</RadioItem>
              <RadioItem value="Red">Red</RadioItem>
              <RadioItem value="Orange">Orange</RadioItem>
              <RadioItem value="Blue">Blue</RadioItem>
              <RadioItem value="Mattapan">Mattapan</RadioItem>
              <RadioItem value="Silver Line">Silver Line</RadioItem>
              <RadioItem value="Bus">Bus</RadioItem>
            </RadioList>
          </Col>
          <Col>
            <MessageTable
              isLoading={false}
              isReadOnly={false}
              headers={["Alert message", "ID", "Start-End", "Last modified"]}
              addSelectColumn
              addMoreActions={false}
              rows={filteredAlerts.map((alert: Alert) => {
                return (
                  <AssociateAlertsRow
                    key={alert.id}
                    alert={alert}
                    onSelect={() => setSelectedAlert(alert)}
                  />
                );
              })}
              emptyStateText="There are no alerts of this type"
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

export default AssociateAlert;
