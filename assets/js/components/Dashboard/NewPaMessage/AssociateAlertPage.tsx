import React, {
  Dispatch,
  SetStateAction,
  ComponentType,
  useState,
  useEffect,
} from "react";
import {
  Button,
  Container,
  Row,
  Col,
  ButtonGroup,
  Modal,
  Form,
} from "react-bootstrap";
import { fetchActiveAndFutureAlerts } from "Utils/api";
import { Alert } from "Models/alert";
import classNames from "classnames";
import { getAlertEarliestStartLatestEnd } from "../../../util";
import { Page } from "./types";
import moment from "moment";

interface AssociateAlertPageProps {
  associatedAlert: Alert;
  endWithEffectPeriod: boolean;
  importLocations: boolean;
  importMessage: boolean;
  navigateTo: (page: Page) => void;
  setAssociatedAlert: Dispatch<SetStateAction<Alert>>;
  setEndWithEffectPeriod: Dispatch<SetStateAction<boolean>>;
  setImportLocations: Dispatch<SetStateAction<boolean>>;
  setImportMessage: Dispatch<SetStateAction<boolean>>;
  setVisualText: Dispatch<SetStateAction<string>>;
}

const AssociateAlertPage = ({
  associatedAlert,
  endWithEffectPeriod,
  importLocations,
  importMessage,
  navigateTo,
  setAssociatedAlert,
  setEndWithEffectPeriod,
  setImportLocations,
  setImportMessage,
  setVisualText,
}: AssociateAlertPageProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchActiveAndFutureAlerts().then(({ alerts: alerts }) => {
      setAlerts(alerts);
    });
  }, []);

  const [selectedMessageState, setSelectedMessageState] =
    useState<string>("active");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("All");
  const [showAlertModal, setShowAlertModal] = useState<boolean>(
    associatedAlert.id !== undefined,
  );

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
            <Button variant="link" onClick={() => navigateTo(Page.NEW)}>
              Cancel
            </Button>
          </Col>
        </Row>
        <Row className="associate-alert-page-body">
          <Col className="associate-alert-filter-selection">
            <div className="associate-alert-filter-selection__label">
              Message state
            </div>
            <ButtonGroup
              className="associate-alert-filter-selection__button-group"
              vertical
            >
              <Button
                className={classNames({
                  "associate-alert-filter-selection__selected":
                    selectedMessageState === "active",
                })}
                onClick={() => setSelectedMessageState("active")}
              >
                Active
              </Button>
              <Button
                className={classNames({
                  "associate-alert-filter-selection__selected":
                    selectedMessageState === "future",
                })}
                onClick={() => setSelectedMessageState("future")}
              >
                Future
              </Button>
            </ButtonGroup>
            <div className="associate-alert-filter-selection__label">
              Service type
            </div>
            <ButtonGroup vertical>
              {serviceTypes.map((serviceType) => {
                return (
                  <Button
                    key={serviceType}
                    className={classNames({
                      "associate-alert-filter-selection__selected":
                        selectedServiceType === serviceType,
                    })}
                    onClick={() => setSelectedServiceType(serviceType)}
                  >
                    {serviceType}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Col>
          <Col>
            <AssociateAlertsTable
              alerts={alerts}
              messageStateFilter={selectedMessageState}
              serviceTypeFilter={selectedServiceType}
              setAssociatedAlert={setAssociatedAlert}
              setShowAlertModal={setShowAlertModal}
            />
          </Col>
        </Row>
      </Container>
      <Modal className="alert-items-modal" show={showAlertModal} centered>
        <Modal.Header
          closeButton
          closeVariant="white"
          onHide={() => {
            setAssociatedAlert({} as Alert);
            setShowAlertModal(false);
          }}
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
                {associatedAlert.id}
              </div>
            </div>
            {associatedAlert.header}
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
            onClick={() => {
              setAssociatedAlert({} as Alert);
              setShowAlertModal(false);
            }}
            className="cancel-button"
            variant="link"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (importMessage) {
                setVisualText(associatedAlert.header);
              }
              navigateTo(Page.NEW);
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
  messageStateFilter: string;
  serviceTypeFilter: string;
  setAssociatedAlert: Dispatch<SetStateAction<Alert>>;
  setShowAlertModal: Dispatch<SetStateAction<boolean>>;
}

const AssociateAlertsTable: ComponentType<AssociateAlertsTableProps> = ({
  alerts,
  messageStateFilter,
  serviceTypeFilter,
  setAssociatedAlert,
  setShowAlertModal,
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
                  setAssociatedAlert={setAssociatedAlert}
                  setShowAlertModal={setShowAlertModal}
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
  setAssociatedAlert: Dispatch<SetStateAction<Alert>>;
  setShowAlertModal: Dispatch<SetStateAction<boolean>>;
}

const AssociateAlertsTableRow: ComponentType<AssociateAlertsTableRowProps> = ({
  alert,
  setAssociatedAlert,
  setShowAlertModal,
}: AssociateAlertsTableRowProps) => {
  const [start, end] = getAlertEarliestStartLatestEnd(alert.active_period);

  const last_modified = moment(alert.updated_at).format("l LT");

  return (
    <tr
      className="associate-alert-table__row"
      onClick={() => {
        setShowAlertModal(true);
        setAssociatedAlert(alert);
      }}
    >
      <td>{alert.header}</td>
      <td>{alert.id}</td>
      <td>
        {start}
        <br />
        {end}
      </td>
      <td>{last_modified}</td>
      <td className="associate-alert-table__select">
        <Button
          variant="link"
          onClick={() => {
            setShowAlertModal(true);
            setAssociatedAlert(alert);
          }}
        >
          Select
        </Button>
      </td>
    </tr>
  );
};

export default AssociateAlertPage;
