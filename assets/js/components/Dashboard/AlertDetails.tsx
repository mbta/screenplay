import React, { ComponentType, useEffect, useState } from "react";
import AlertCard from "./AlertCard";
import { PlacesList } from "./PlacesPage";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../models/alert";
import { Button } from "react-bootstrap";
import { ArrowLeft, ArrowUpRight } from "react-bootstrap-icons";
import { formatEffect, placesWithSelectedAlert } from "../../util";
import { useScreenplayContext } from "../../hooks/useScreenplayContext";

const AlertDetails: ComponentType = () => {
  const { places, alerts, screensByAlertMap } = useScreenplayContext();
  const { id } = useParams();
  const [selectedAlert, setSelectedAlert] = useState<Alert>();

  const alertsUiUrl = document
    .querySelector("meta[name=alerts-ui-url]")
    ?.getAttribute("content");

  const navigate = useNavigate();

  useEffect(() => {
    // If the alerts fetch has finished and the ID in the URL does not exist in the list, go back to the Posted Alerts page.
    if (alerts.length) {
      const selectedAlert = alerts.find((alert) => alert.id === id);
      if (!selectedAlert) {
        navigate("/alerts", { replace: true });
      } else {
        setSelectedAlert(selectedAlert);
      }
    }
  }, [alerts]);

  return selectedAlert ? (
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
      <div className="page-content__body">
        <>
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
        </>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default AlertDetails;
