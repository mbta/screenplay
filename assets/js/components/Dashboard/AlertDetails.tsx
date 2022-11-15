import React, { ComponentType } from "react";
import AlertCard from "./AlertCard";
import { PlacesList } from "./PlacesPage";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { Button } from "react-bootstrap";
import { ArrowLeft, ArrowUpRight } from "react-bootstrap-icons";
import { formatEffect, placesWithSelectedAlert } from "../../util";
import { ScreensByAlert } from "../../models/screensByAlert";

const AlertDetails: ComponentType = () => {
  const { places, alerts, screensByAlertMap } = useOutletContext<{
    places: Place[];
    alerts: Alert[];
    screensByAlertMap: ScreensByAlert;
  }>();
  const { id } = useParams();
  const selectedAlert = alerts.find((alert) => alert.id === id);
  const alertsUiUrl = document
    .querySelector("meta[name=alerts-ui-url]")
    ?.getAttribute("content");
  const navigate = useNavigate();

  if (!selectedAlert) {
    navigate("/alerts", { replace: true });
  }

  return selectedAlert ? (
    <div className="alert-details">
      <div className="page-content__header">
        <div>
          <Button
            className="alert-details__back-button"
            data-testid="alert-details-back-button"
            onClick={() => navigate(-1)}
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
          />
        </>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default AlertDetails;
