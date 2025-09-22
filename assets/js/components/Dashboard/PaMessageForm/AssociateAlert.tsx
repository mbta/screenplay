import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { fetchActiveAndFutureAlerts } from "Utils/api";
import { Alert } from "Models/alert";
import MessageTable from "../../Tables/MessageTable";
import AssociateAlertsRow from "../../Tables/Rows/AssociateAlertRow";
import { RadioList } from "Components/RadioList";
import * as styles from "Styles/pa-messages.module.scss";
import { useHideSidebar } from "Hooks/useHideSidebar";

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
  useHideSidebar();

  useEffect(() => {
    fetchActiveAndFutureAlerts().then((data) => {
      if (data) {
      setAlerts(data.alerts);
      }
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
    <div className="mx-5 my-4">
      <div className="d-flex justify-content-between align-items-start">
        <h1 className="mb-5">Select alert to associate with PA/ESS Message</h1>
        <Button
          variant="link"
          className={styles.transparentButton}
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
      </div>
      <div className="d-flex gap-5">
        <div style={{ flex: "0 0 200px" }}>
          <div className="mb-2">Filter by message state</div>
          <RadioList
            className="mb-5"
            value={selectedMessageState}
            onChange={setSelectedMessageState}
            items={[
              { value: "active", content: "Live" },
              { value: "future", content: "Future" },
            ]}
          />
          <div className="mb-2">Filter by service type</div>
          <RadioList
            value={selectedServiceType}
            onChange={setSelectedServiceType}
            items={[
              { value: "All", content: "All" },
              { value: "Green", content: "Green" },
              { value: "Red", content: "Red" },
              { value: "Orange", content: "Orange" },
              { value: "Blue", content: "Blue" },
              { value: "Mattapan", content: "Mattapan" },
              { value: "Silver Line", content: "Silver Line" },
              { value: "Bus", content: "Bus" },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
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
        </div>
      </div>
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
