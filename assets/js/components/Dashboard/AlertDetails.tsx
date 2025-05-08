import React, { ComponentType, useEffect, useState } from "react";
import AlertCard from "Components/AlertCard";
import AlertNotFoundPage from "Components/AlertNotFoundPage";
import { PlacesList } from "Components/PlacesPage";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "Models/alert";
import { Button, Modal } from "react-bootstrap";
import {
  ArrowLeft,
  ArrowUpRight,
  SlashCircleFill,
} from "react-bootstrap-icons";
import { formatEffect, placesWithSelectedAlert } from "../../util";
import {
  PlacesListStateContainer,
  useScreenplayState,
} from "Hooks/useScreenplayContext";

const AlertDetails: ComponentType = () => {
  const { places, alerts, allAPIAlertIds, screensByAlertMap } =
    useScreenplayState();
  const { id } = useParams();
  const [selectedAlert, setSelectedAlert] = useState<Alert>();

  const alertsUiUrl = document
    .querySelector("meta[name=alerts-ui-url]")
    ?.getAttribute("content");

  const navigate = useNavigate();

  const foundAlert = alerts.find((alert) => alert.id === id);
  useEffect(() => {
    if (foundAlert) {
      setSelectedAlert(foundAlert);
    }
  }, [foundAlert]);

  const validAlertId = id && allAPIAlertIds.includes(id) ? id : undefined;

  return selectedAlert ? (
    // Define a new ContextProvider so state is not saved to Context used on the PlacesPage.
    <PlacesListStateContainer>
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
                screensByAlertMap,
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
        show={selectedAlert && !foundAlert}
      >
        <Modal.Body>
          <SlashCircleFill size={24} className="alert-not-found_icon" />
          <div>
            <div className="alert-not-found_title">This alert was closed</div>
            <p className="alert-not-found_detail">
              This {formatEffect(selectedAlert.effect)} alert was just closed.
              If it was previously showing on any screens, it has since been
              removed.
            </p>
            <Button
              className="screenplay-button alert-not-found_button"
              onClick={() => navigate("/alerts", { replace: true })}
            >
              Go to Posted Alerts
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </PlacesListStateContainer>
  ) : (
    <AlertNotFoundPage validAlertId={validAlertId} />
  );
};

export default AlertDetails;
