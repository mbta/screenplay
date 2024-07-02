import React, { ComponentType } from "react";
import AppBar from "Components/PermanentConfiguration/AppBar";
import { Outlet } from "react-router-dom";

const ConfigureScreensPage: ComponentType = () => {
  return (
    <div className="configure-screens-page">
      <AppBar title="Configure Screens" />
      <Outlet />
    </div>
  );
};

export default ConfigureScreensPage;
