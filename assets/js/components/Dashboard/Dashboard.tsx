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

type ContextType = {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
};

const SIGNIFICANT_ALERT_EFFECTS = [
  "SHUTTLE",
  "STATION_CLOSURE",
  "STOP_CLOSURE",
  "SUSPENSION",
  "DETOUR",
  "STOP_MOVED",
  "SNOW_ROUTE",
];

const Dashboard: ComponentType = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {}
  );
  const [bannerAlert, setBannerAlert] = useState<Alert | undefined>();

  useEffect(() => {
    fetchPlaces().then((placesList) => setPlaces(placesList));

    fetchAlerts().then(({ alerts, screens_by_alert }) => {
      setAlerts(alerts);
      setScreensByAlertMap(screens_by_alert);
    });
  }, []);

  // Fetch alerts every 4 seconds.
  useInterval(() => {
    fetchAlerts().then(({ alerts, screens_by_alert }) => {
      setAlerts(alerts);
      setScreensByAlertMap(screens_by_alert);
    });
  }, 4000);

  useEffect(() => {
    setBannerAlert(getAlertForBanner(alerts));
  }, [alerts]);

  const getAlertForBanner = (alerts: Alert[]) => {
    const now = moment().utc();
    const twoMinutesAgo = moment().subtract(2, "minutes").utc();

    return (
      alerts
        // filter out alerts that have a create_at or updated_at older than two minutes ago
        .filter((alert) => {
          const createdAt = moment(alert.created_at).utc();
          const updatedAt = moment(alert.updated_at).utc();

          return (
            SIGNIFICANT_ALERT_EFFECTS.includes(alert.effect) &&
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
        {bannerAlert && <div>{bannerAlert?.id}</div>}
        <Outlet context={{ places, alerts, screensByAlertMap }} />
      </div>
    </div>
  );
};

export const useDashboardContext = () => {
  return useOutletContext<ContextType>();
};

export default Dashboard;
