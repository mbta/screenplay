import React, { ComponentType, useState } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  ButtonGroup,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useScreenplayContext } from "../../hooks/useScreenplayContext";
import {
  useAssociatedAlertContext,
  useAssociatedAlertDispatchContext,
} from "../../hooks/useScreenplayContext";
import { Alert } from "../../models/alert";
import classNames from "classnames";
import { getAlertEarliestStartLatestEnd } from "../../util";

const AssociateAlertPage = () => {
  const navigate = useNavigate();
  const {
    associatedAlert,
    endWithEffectPeriod: endWithEffectPeriodState,
    importLocations: importLocationsState,
    importMessage: importMessageState,
  } = useAssociatedAlertContext();
  const { alerts } = useScreenplayContext();
  const [selectedMessageState, setSelectedMessageState] =
    useState<string>("active");
  const [showAlertModal, setShowAlertModal] = useState<boolean>(
    Object.keys(associatedAlert).length !== 0,
  );
  const [selectedServiceType, setSelectedServiceType] = useState<string>("All");
  const [selectedAlert, setSelectedAlert] = useState<Alert>(associatedAlert);
  const [endWithEffectPeriod, setEndWithEffectPeriod] = useState<boolean>(
    endWithEffectPeriodState,
  );
  const [importLocations, setImportLocations] =
    useState<boolean>(importLocationsState);
  const [importMessage, setImportMessage] =
    useState<boolean>(importMessageState);
  const dispatch = useAssociatedAlertDispatchContext();
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
    <>
      <Container className="associate-alert-page" fluid>
        <Row className="associate-alert-page-header">
          <Col>
            <h1>Select alert to associate with PA/ESS Message</h1>
          </Col>
          <Col className="associate-alert-page-header__cancel">
            <Button variant="link" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Col>
        </Row>
        <Row className="associate-alert-page-body">
          <Col className="associate-alert-filter-selection">
            <div>Message state</div>
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
            <div>Service type</div>
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
              setSelectedAlert={setSelectedAlert}
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
            setSelectedAlert({} as Alert);
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
                {selectedAlert.id}
              </div>
              <Button
                className="alert-description__header-change-alert"
                onClick={() => {
                  setSelectedAlert({} as Alert);
                  setShowAlertModal(false);
                }}
                variant="link"
              >
                Change alert
              </Button>
            </div>
            {selectedAlert.header}
          </div>
          <div className="checkbox">
            <Form.Check
              className="checkbox"
              label="End PA/ESS message at the end of alert effect period"
              checked={endWithEffectPeriod}
              onChange={() => setEndWithEffectPeriod(!endWithEffectPeriod)}
            />
          </div>
          <div className="checkbox">
            <Form.Check
              label="Import locations"
              checked={importLocations}
              onChange={() => setImportLocations(!importLocations)}
            />
            <div className="subtext">Locations will be editable</div>
          </div>
          <div className="checkbox">
            <Form.Check
              label="Import message"
              checked={importMessage}
              onChange={() => setImportMessage(!importMessage)}
            />
            <div className="subtext">Message will be editable</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setSelectedAlert({} as Alert);
              setShowAlertModal(false);
            }}
            className="cancel-button"
            variant="link"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({
                type: "SET_ASSOCIATED_ALERT",
                associatedAlert: selectedAlert,
                endWithEffectPeriod: endWithEffectPeriod,
                importLocations: importLocations,
                importMessage: importMessage,
              });
              navigate(-1);
            }}
            className="apply-button"
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

interface AssociateAlertsTableProps {
  alerts: Alert[];
  messageStateFilter: string;
  serviceTypeFilter: string;
  setSelectedAlert: (alert: Alert) => void;
  setShowAlertModal: (showAlertMoal: boolean) => void;
}

const AssociateAlertsTable: ComponentType<AssociateAlertsTableProps> = ({
  alerts,
  messageStateFilter,
  serviceTypeFilter,
  setSelectedAlert,
  setShowAlertModal,
}: AssociateAlertsTableProps) => {
  return (
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
        {alerts
          .filter((alert) => {
            const alertStart = new Date(alert.active_period[0].start);
            const currentTime = new Date();
            return messageStateFilter === "active"
              ? alertStart <= currentTime
              : alertStart > currentTime;
          })
          .filter((alert) => {
            return serviceTypeFilter === "All"
              ? true
              : alert.affected_list.some((affected) =>
                  affected.includes(serviceTypeFilter.toLowerCase()),
                );
          })
          .map((alert: Alert) => {
            return (
              <AssociateAlertsTableRow
                key={alert.id}
                alert={alert}
                setSelectedAlert={setSelectedAlert}
                setShowAlertModal={setShowAlertModal}
              />
            );
          })}
      </tbody>
    </table>
  );
};

interface AssociateAlertsTableRowProps {
  alert: Alert;
  setSelectedAlert: (alert: Alert) => void;
  setShowAlertModal: (showAlertModal: boolean) => void;
}

const AssociateAlertsTableRow: ComponentType<AssociateAlertsTableRowProps> = ({
  alert,
  setSelectedAlert,
  setShowAlertModal,
}: AssociateAlertsTableRowProps) => {
  const [start, end] = getAlertEarliestStartLatestEnd(alert.active_period);

  const last_modified = new Date(alert.updated_at)
    .toLocaleTimeString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(",", "");

  return (
    <tr
      className="associate-alert-table__row"
      onClick={() => {
        setShowAlertModal(true);
        setSelectedAlert(alert);
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
            setSelectedAlert(alert);
          }}
        >
          Select
        </Button>
      </td>
    </tr>
  );
};

export default AssociateAlertPage;
