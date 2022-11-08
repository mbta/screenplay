import React, { ComponentType, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useOutletContext } from "react-router-dom";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";
import { useInterval } from "../../hooks/useInterval";
import { fetchAlerts, fetchPlaces } from "../../utils/api";

type ContextType = {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
};

const Dashboard: ComponentType = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {}
  );

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

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        <Outlet context={{ places, alerts, screensByAlertMap }} />
      </div>
    </div>
  );
};

export const useDashboardContext = () => {
  return useOutletContext<ContextType>();
};

export default Dashboard;
