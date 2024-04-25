import React, { ComponentType, useEffect, useState } from "react";
import { Outlet } from "react-router";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import Sidebar from "./Sidebar";
import {
  useScreenplayContext,
  useScreenplayDispatchContext,
} from "../../hooks/useScreenplayContext";
import { useInterval } from "../../hooks/useInterval";
import { fetchAlerts, fetchPlaces } from "../../utils/api";
import AlertBanner from "./AlertBanner";
import LinkCopiedToast from "./LinkCopiedToast";
import ActionOutcomeToast from "./ActionOutcomeToast";
import { useLocation } from "react-router-dom";

const Dashboard: ComponentType = () => {
  const { alerts, bannerAlert, showLinkCopied, actionOutcomeToast } =
    useScreenplayContext();
  const dispatch = useScreenplayDispatchContext();
  const [bannerDone, setBannerDone] = useState(false);

  useEffect(() => {
    fetchAlerts().then(
      ({
        all_alert_ids: allAPIalertIds,
        alerts: newAlerts,
        screens_by_alert: screensByAlertMap,
      }) => {
        findAndSetBannerAlert(alerts, newAlerts);
        dispatch({
          type: "SET_ALERTS",
          alerts: newAlerts,
          allAPIAlertIds: allAPIalertIds,
          screensByAlertMap: screensByAlertMap,
        });
      },
    );

    fetchPlaces().then((placesList) =>
      dispatch({ type: "SET_PLACES", places: placesList }),
    );
  }, []);

  // Fetch alerts every 4 seconds.
  useInterval(() => {
    fetchAlerts().then(
      ({
        all_alert_ids: allAPIalertIds,
        alerts: newAlerts,
        screens_by_alert: screensByAlertMap,
      }) => {
        findAndSetBannerAlert(alerts, newAlerts);
        dispatch({
          type: "SET_ALERTS",
          alerts: newAlerts,
          allAPIAlertIds: allAPIalertIds,
          screensByAlertMap: screensByAlertMap,
        });
      },
    );
  }, 4000);

  const findAndSetBannerAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const now = new Date();
    const closedAlert = getFirstClosedAlert(oldAlerts, newAlerts);
    const postedOrEditedAlert = getPostedOrEditedAlert(newAlerts);
    const existingStartAtOrNull = bannerAlert
      ? new Date(bannerAlert.startedAt)
      : null;

    // If there is a closed alert, just show it and save when it was closed.
    if (closedAlert) {
      setBannerDone(false);
      dispatch({
        type: "SET_BANNER_ALERT",
        bannerAlert: { alert: closedAlert, type: "closed", startedAt: now },
      });
    }
    // If there's a recent postedOrEditedAlert AND:
    // there is not a current bannerAlert OR
    // an alert was posted or edited after the current bannerAlert started displaying
    else if (
      postedOrEditedAlert &&
      (bannerAlert === undefined ||
        new Date(postedOrEditedAlert.updated_at).getTime() >
          new Date(bannerAlert.startedAt).getTime())
    ) {
      setBannerDone(false);
      dispatch({
        type: "SET_BANNER_ALERT",
        bannerAlert: {
          alert: postedOrEditedAlert,
          type: "postedOrEdited",
          startedAt: new Date(postedOrEditedAlert.updated_at),
        },
      });
    }
    // If no other alert is eligible to be the bannerAlert and it has been 40 seconds since it started displaying,
    // queue expiration of the bannerAlert.
    else if (
      existingStartAtOrNull &&
      now.getTime() >=
        new Date(existingStartAtOrNull.getTime() + 40000).getTime()
    ) {
      setBannerDone(true);
    }
  };

  const getFirstClosedAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const newAlertIds = newAlerts.map((alert) => alert.id);
    return oldAlerts.filter((alert) => !newAlertIds.includes(alert.id))[0];
  };

  const getPostedOrEditedAlert = (alerts: Alert[]) => {
    const now = new Date();
    const fortySecondsAgo = new Date(now.getTime() - 40000);

    return (
      alerts
        // filter out alerts that have an updated_at older than forty seconds ago
        .filter((alert) => {
          const updatedAt = new Date(alert.updated_at);

          return (
            updatedAt.getTime() > fortySecondsAgo.getTime() &&
            updatedAt.getTime() < now.getTime()
          );
        })
        // sort them in descending order to get the most recently created or updated alert
        .sort((a1, a2) =>
          new Date(a1.updated_at) < new Date(a2.updated_at) ? 1 : -1,
        )
        // get the first alert in the list or underfined if there are none
        .find((alert) => alert)
    );
  };

  const queueBannerAlertExpiration = () => {
    setTimeout(
      () =>
        dispatch({
          type: "SET_BANNER_ALERT",
          bannerAlert: undefined,
        }),
      5000,
    );
  };

  const pathname = useLocation().pathname;
  const showAlertBanner =
    !pathname.includes("configure-screens") && bannerAlert?.alert;

  const showSidebar = !pathname.includes("configure-screens");

  return (
    <div className="screenplay-container">
      <LinkCopiedToast show={showLinkCopied} />
      <ActionOutcomeToast {...actionOutcomeToast} />
      {showSidebar && <Sidebar />}
      <div className="page-content">
        {showAlertBanner && (
          <AlertBanner
            isDone={bannerDone}
            queueExpiration={queueBannerAlertExpiration}
          />
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
