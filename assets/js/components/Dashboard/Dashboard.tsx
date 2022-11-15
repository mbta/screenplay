import React, { ComponentType, useEffect, useState } from "react";
import { Outlet } from "react-router";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";

interface AlertsResponse {
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

const Dashboard: ComponentType = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {}
  );

  useEffect(() => {
    fetch("/api/alerts")
      .then((response) => response.json())
      .then(({ alerts, screens_by_alert }: AlertsResponse) => {
        setAlerts(alerts);
        setScreensByAlertMap(screens_by_alert);
      });
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(placeList);
      });
  }, []);

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        <Outlet context={{ places, alerts, screensByAlertMap }} />
      </div>
    </div>
  );
};

export default Dashboard;
