import React, { ComponentType, useEffect, useState } from "react";
import AlertCard from "./AlertCard";
import { PlacesList } from "./PlacesPage";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../models/alert";
import { Button, Modal } from "react-bootstrap";
import {
  ArrowLeft,
  ArrowUpRight,
  SlashCircleFill,
} from "react-bootstrap-icons";
import { formatEffect, placesWithSelectedAlert } from "../../util";
import {
  DirectionID,
  useScreenplayContext,
} from "../../hooks/useScreenplayContext";
import {
  MODES_AND_LINES,
  SCREEN_TYPES,
  STATUSES,
} from "../../constants/constants";

const AlertDetails: ComponentType = () => {
  const screenplayContext = useScreenplayContext();
  const [contextState, setContextState] = useState(screenplayContext);
  const { places, screensByAlertMap } = contextState;
  const { id } = useParams();
  const [selectedAlert, setSelectedAlert] = useState<Alert>();

  const alertsUiUrl = document
    .querySelector("meta[name=alerts-ui-url]")
    ?.getAttribute("content");

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [sortDirection, setSortDirection] = useState(0 as DirectionID);
  const [modeLineFilterValue, setModeLineFilterValue] = useState(
    MODES_AND_LINES[0]
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] = useState(
    SCREEN_TYPES[0]
  );
  const [statusFilterValue, setStatusFilterValue] = useState(STATUSES[0]);
  const [activeEventKeys, setActiveEventKeys] = useState([]);

  const dispatch = (action: any) => {
    switch (action.type) {
      case "SET_SORT_DIRECTION":
        setSortDirection(action.sortDirection);
        break;
      case "SET_MODE_LINE_FILTER":
        setModeLineFilterValue(action.filterValue);
        setActiveEventKeys([]);
        break;
      case "SET_SCREEN_TYPE_FILTER":
        setScreenTypeFilterValue(action.filterValue);
        setActiveEventKeys([]);
        break;
      case "SET_STATUS_FILTER":
        setStatusFilterValue(action.filterValue);
        setActiveEventKeys([]);
        break;
      case "SET_ACTIVE_EVENT_KEYS":
        setActiveEventKeys(action.eventKeys);
        break;
      case "RESET_STATE":
        setSortDirection(0 as DirectionID);
        setModeLineFilterValue(MODES_AND_LINES[0]);
        setScreenTypeFilterValue(SCREEN_TYPES[0]);
        setStatusFilterValue(STATUSES[0]);
        setActiveEventKeys([]);
    }
  };

  useEffect(() => {
    const selectedAlert = screenplayContext.alerts.length
      ? screenplayContext.alerts.find((alert) => alert.id === id)
      : null;

    if (selectedAlert) {
      setContextState(screenplayContext);
      setSelectedAlert(selectedAlert);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, [screenplayContext]);

  return selectedAlert ? (
    <>
      <div className="alert-details">
        <div className="page-content__header">
          <div>
            <Button
              className="alert-details__back-button"
              data-testid="alert-details-back-button"
              onClick={() => navigate("/alerts", { replace: true })}
            >
              <ArrowLeft /> Back
            </Button>
            <span>
              {formatEffect(selectedAlert.effect)} #{selectedAlert.id}
            </span>
            <Button
              href={alertsUiUrl + `/edit/${selectedAlert.id}`}
              target="_blank"
              className="alert-details__external-link"
            >
              Edit Alert <ArrowUpRight />
            </Button>
          </div>
        </div>
        {Object.keys(screensByAlertMap).length !== 0 && (
          <div className="page-content__body">
            <AlertCard alert={selectedAlert} classNames="selected-alert" />
            <PlacesList
              places={placesWithSelectedAlert(
                selectedAlert,
                places,
                screensByAlertMap
              )}
              dispatch={dispatch}
              noModeFilter
              isAlertPlacesList
              showAnimationForNewPlaces
              stateValues={{
                sortDirection,
                modeLineFilterValue,
                screenTypeFilterValue,
                statusFilterValue,
                activeEventKeys,
              }}
            />
          </div>
        )}
      </div>
      <Modal
        className="alert-not-found"
        backdropClassName="alert-not-found"
        show={showModal}
      >
        <Modal.Body>
          <SlashCircleFill className="modal-icon" />
          <div className="modal-text">
            <div className="modal-title">This alert was closed</div>
            <p className="modal-detail">
              This {formatEffect(selectedAlert.effect)} alert was just closed.
              If it was previously showing on any screens, it has since been
              removed.
            </p>
            <Button
              className="screenplay-button modal-button"
              variant="primary"
              onClick={() => navigate("/alerts", { replace: true })}
            >
              <ArrowLeft className="modal-button__icon" />
              Go to Posted Alerts
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  ) : (
    <></>
  );
};

export default AlertDetails;
