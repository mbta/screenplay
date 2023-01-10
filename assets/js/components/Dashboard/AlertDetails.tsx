import React, { ComponentType, useEffect, useReducer, useState } from "react";
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
  placesListReducer,
  useScreenplayContext,
  initialPlacesListState,
} from "../../hooks/useScreenplayContext";

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

  const [placesListState, placesListDispatch] = useReducer(
    placesListReducer,
    initialPlacesListState
  );

  return selectedAlert ? (
    // Define a new ContextProvider so state is not saved to Context used on the PlacesPage.
    <>
      <div className="alert-details">
        <div className="page-content__header">
          <div>
            <Button
              className="alert-details__back-button"
              data-testid="alert-details-back-button"
              onClick={() => navigate("/alerts", { replace: true })}
            >
              <ArrowLeft className="bootstrap-line-icon" /> Back
            </Button>
            <span>
              {formatEffect(selectedAlert.effect)} #{selectedAlert.id}
            </span>
            <Button
              href={alertsUiUrl + `/edit/${selectedAlert.id}`}
              target="_blank"
              className="alert-details__external-link"
            >
              Edit Alert <ArrowUpRight className="bootstrap-line-icon" />
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
              screenCountOverride={screensByAlertMap[selectedAlert.id].length}
              noModeFilter
              isAlertPlacesList
              showAnimationForNewPlaces
              dispatch={placesListDispatch}
              stateValues={placesListState}
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
          <SlashCircleFill
            size={24}
            className="bootstrap-line-icon modal-icon"
          />
          <div className="modal-text">
            <div className="modal-title">This alert was closed</div>
            <p className="modal-detail">
              This {formatEffect(selectedAlert.effect)} alert was just closed.
              If it was previously showing on any screens, it has since been
              removed.
            </p>
            <Button
              className="screenplay-button modal-button"
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
