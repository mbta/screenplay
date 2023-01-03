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
import { useScreenplayContext } from "../../hooks/useScreenplayContext";

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
              noModeFilter
              isAlertPlacesList
              showAnimationForNewPlaces
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
