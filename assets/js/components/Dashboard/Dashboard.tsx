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
import moment from "moment";
import { fetchAlerts, fetchPlaces } from "../../utils/api";
import AlertBanner from "./AlertBanner";
import { isSignificantAlert } from "../../util";

const Dashboard: ComponentType = () => {
  const { alerts, bannerAlert } = useScreenplayContext();
  const dispatch = useScreenplayDispatchContext();
  const [bannerDone, setBannerDone] = useState(false);

  useEffect(() => {
    fetchAlerts((newAlerts, screens_by_alert) => {
      findAndSetBannerAlert(alerts, newAlerts);
      dispatch({ type: "SET_ALERTS", alerts: newAlerts });
      dispatch({
        type: "SET_SCREENS_BY_ALERT",
        screensByAlertMap: screens_by_alert,
      });
    });

    fetchPlaces((placesList) =>
      dispatch({ type: "SET_PLACES", places: placesList })
    );
  }, []);

  // Fetch alerts every 4 seconds.
  useInterval(() => {
    fetchAlerts((newAlerts, screens_by_alert) => {
      findAndSetBannerAlert(alerts, newAlerts);
      dispatch({ type: "SET_ALERTS", alerts: newAlerts });
      dispatch({
        type: "SET_SCREENS_BY_ALERT",
        screensByAlertMap: screens_by_alert,
      });
    });
  }, 4000);

  const findAndSetBannerAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const now = moment().utc().format();
    const closedAlert = getFirstClosedAlert(oldAlerts, newAlerts);
    const postedOrEditedAlert = getPostedOrEditedAlert(newAlerts);
    // If there is a closed alert, just show it and save when it was closed.
    if (closedAlert) {
      setBannerDone(false);
      dispatch({
        type: "SET_BANNER_ALERT",
        bannerAlert: { alert: closedAlert, type: "closed", startedAt: now },
      });
    }
    // If there a recent postedOrEditedAlert AND
    // there is not a current bannerAlert OR
    // and alert was posted or edited after the current bannerAlert started displaying
    else if (
      postedOrEditedAlert &&
      (bannerAlert === undefined ||
        moment(postedOrEditedAlert.updated_at).isAfter(
          moment(bannerAlert.startedAt)
        ))
    ) {
      setBannerDone(false);
      dispatch({
        type: "SET_BANNER_ALERT",
        bannerAlert: {
          alert: postedOrEditedAlert,
          type: "postedOrEdited",
          startedAt: postedOrEditedAlert.updated_at,
        },
      });
    }
    // If no other alert is eligible to be the bannerAlert and it has been 40 seconds since it started displaying,
    // queue expiration of the bannerAlert.
    else if (
      moment(now).isSameOrAfter(
        moment(bannerAlert?.startedAt).add(40, "seconds")
      )
    ) {
      setBannerDone(true);
    }
  };

  const getFirstClosedAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const newAlertIds = newAlerts.map((alert) => alert.id);
    return oldAlerts
      .filter((alert) => !newAlertIds.includes(alert.id))
      .find((alert) => alert && isSignificantAlert(alert));
  };

  const getPostedOrEditedAlert = (alerts: Alert[]) => {
    const now = moment().utc();
    const fortySecondsAgo = moment().subtract(40, "seconds").utc();

    return (
      alerts
        // filter out alerts that have a updated_at older than two minutes ago
        .filter((alert) => {
          const updatedAt = moment(alert.updated_at).utc();

          return (
            isSignificantAlert(alert) &&
            updatedAt.isBetween(fortySecondsAgo, now)
          );
        })
        // sort them in descending order to get the most recently created or updated alert
        .sort((a1, a2) =>
          moment(a1.updated_at).isBefore(a2.updated_at) ? 1 : -1
        )
        // get the first alert in the list or underfined if there are none
        .find((alert) => alert)
    );
  };

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        {bannerAlert?.alert && <AlertBanner isDone={bannerDone} />}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
