import React, { ComponentType, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useOutletContext } from "react-router-dom";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";
import { useInterval } from "../../hooks/useInterval";
import moment from "moment";
import { fetchAlerts, fetchPlaces } from "../../utils/api";
import AlertBanner from "./AlertBanner";
import { isSignificantAlert } from "../../util";

type ContextType = {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
};

interface BannerAlert {
  alert?: Alert;
  closedAt?: string;
}

const Dashboard: ComponentType = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {}
  );
  const [bannerAlert, setBannerAlert] = useState<BannerAlert>();

  useEffect(() => {
    fetchPlaces().then((placesList) => setPlaces(placesList));

    fetchAlerts().then(({ alerts: newAlerts, screens_by_alert }) => {
      setAlerts((oldAlerts) => {
        findAndSetBannerAlert(oldAlerts, newAlerts);
        return newAlerts;
      });
      setScreensByAlertMap(screens_by_alert);
    });
  }, []);

  // Fetch alerts every 4 seconds.
  useInterval(() => {
    fetchAlerts().then(({ alerts: newAlerts, screens_by_alert }) => {
      setAlerts((oldAlerts) => {
        findAndSetBannerAlert(oldAlerts, newAlerts);
        return newAlerts;
      });
      setScreensByAlertMap(screens_by_alert);
    });
  }, 4000);

  const findAndSetBannerAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const now = moment().utc().format();
    const closedAlert = getFirstClosedAlert(oldAlerts, newAlerts);
    const postedOrEditedAlert = getPostedOrEditedAlert(newAlerts);
    // If there is a closed alert, just show it and save when it was closed.
    if (closedAlert) {
      setBannerAlert({ alert: closedAlert, closedAt: now });
    }
    // If there is not a new closed alert but
    // the current bannerAlert does not have a defined closedAt
    // (meaning there isn't a current banner alert or it is a posted/edited alert)
    else if (!bannerAlert?.closedAt) {
      setBannerAlert({ alert: postedOrEditedAlert });
    }
    // If the current bannerAlert has a closedAt but a recent posted/edited alert came after the closed bannerAlert
    else if (
      postedOrEditedAlert &&
      moment(postedOrEditedAlert.created_at).isAfter(
        moment(bannerAlert.closedAt) ||
          moment(postedOrEditedAlert.updated_at).isAfter(
            moment(bannerAlert.closedAt)
          )
      )
    ) {
      setBannerAlert({ alert: postedOrEditedAlert });
    }
    // If no other alert is eligible to be the bannerAlert, expire the current bannerAlert if two minutes have passed since it started displaying.
    else if (
      moment(now).isSameOrAfter(moment(bannerAlert.closedAt).add(2, "minutes"))
    ) {
      setBannerAlert(undefined);
    }
  };

  const getFirstClosedAlert = (oldAlerts: Alert[], newAlerts: Alert[]) => {
    const newAlertIds = newAlerts.map((alert) => alert.id);
    return oldAlerts
      .filter((alert) => newAlertIds.indexOf(alert.id) < 0)
      .find((alert) => alert !== undefined && isSignificantAlert(alert));
  };

  const getPostedOrEditedAlert = (alerts: Alert[]) => {
    const now = moment().utc();
    const twoMinutesAgo = moment().subtract(2, "minutes").utc();

    return (
      alerts
        // filter out alerts that have a create_at or updated_at older than two minutes ago
        .filter((alert) => {
          const createdAt = moment(alert.created_at).utc();
          const updatedAt = moment(alert.updated_at).utc();

          return (
            isSignificantAlert(alert) &&
            (createdAt.isBetween(twoMinutesAgo, now) ||
              updatedAt.isBetween(twoMinutesAgo, now))
          );
        })
        // sort them in descending order to get the most recently created or updated alert
        .sort((a1, a2) =>
          moment(a1.created_at).isBefore(a2.created_at) ||
          moment(a1.updated_at).isBefore(a2.updated_at)
            ? 1
            : -1
        )
        // get the first alert in the list or underfined if there are none
        .find((alert) => alert !== undefined)
    );
  };

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        {bannerAlert?.alert && (
          <AlertBanner
            alert={bannerAlert.alert}
            isClosedAlert={bannerAlert.closedAt !== undefined}
          />
        )}
        <Outlet context={{ places, alerts, screensByAlertMap }} />
      </div>
    </div>
  );
};

export const useDashboardContext = () => {
  return useOutletContext<ContextType>();
};

export default Dashboard;
