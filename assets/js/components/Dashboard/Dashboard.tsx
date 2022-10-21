import React, { ComponentType, useEffect, useState } from "react";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";
import PlacesPage from "./PlacesPage";
import AlertsPage from "./AlertsPage";
import OverridesPage from "./OverridesPage";

interface Props {
  page: "places" | "alerts" | "overrides";
}

const Dashboard: ComponentType<Props> = (props: Props) => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(placeList);
      });
  }, []);

  const visible = {
    places: props.page === "places",
    alerts: props.page === "alerts",
    overrides: props.page === "overrides",
  };

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        <PlacesPage places={places} isVisible={visible.places} />
        <AlertsPage
          places={places}
          screensByAlertId={dummyScreensByAlertId}
          isVisible={visible.alerts}
        />
        <OverridesPage isVisible={visible.overrides} />
      </div>
    </div>
  );
};

const dummyScreensByAlertId: ScreensByAlert = {
  "1": ["EIB-101", "EIG-404"],
  "2": ["PRE-105"],
  "3": ["MUL-101"],
  "4": ["PRE-112", "DUP-BackBay", "BUS-104"],
};

export default Dashboard;
