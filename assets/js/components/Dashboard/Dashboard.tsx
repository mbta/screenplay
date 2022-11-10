import React, { ComponentType, useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import Sidebar from "./Sidebar";

const Dashboard: ComponentType = () => {
  const [places, setPlaces] = useState<Place[]>([]);

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
        <Outlet context={{ places }} />
      </div>
    </div>
  );
};

export function usePlaces() {
  return useOutletContext<{ places: Place[] }>();
}

export default Dashboard;
