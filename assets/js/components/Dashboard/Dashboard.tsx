import React, { ComponentType, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useOutletContext } from "react-router-dom";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import Sidebar from "./Sidebar";

type ContextType = { places: Place[] };

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

export const usePlaces = () => {
  return useOutletContext<ContextType>();
};

export default Dashboard;
