import React from "react";
import { ReactNode } from "react";
import placesAndScreens from "../places_and_screens.test.json";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import alerts from "../alerts.test.json";
import alertsOnScreens from "../alerts_on_screens.test.json";

export const mockOutletContextData: any = {
  places: placesAndScreens,
  alerts: alerts,
  screensByAlertMap: alertsOnScreens,
};

interface RenderRouteWithOutletContextProps<T = any> {
  context: T;
  children: ReactNode;
}

export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps<T>) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Outlet context={context as T} />}>
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
