import React, { ComponentType, useEffect } from "react";
import { Outlet } from "react-router";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";
import { useScreenplayDispatchContext } from "../../hooks/useScreenplayContext";

interface AlertsResponse {
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

const Dashboard: ComponentType = () => {
  const dispatch = useScreenplayDispatchContext();

  useEffect(() => {
    fetch("/api/alerts")
      .then((response) => response.json())
      .then(({ alerts, screens_by_alert }: AlertsResponse) => {
        dispatch({ type: "SET_ALERTS", alerts });
        dispatch({
          type: "SET_SCREENS_BY_ALERT",
          screensByAlertMap: screens_by_alert,
        });
      });
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        dispatch({ type: "SET_PLACES", places: placeList });
      });
  }, []);

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
