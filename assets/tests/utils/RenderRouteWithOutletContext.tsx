import React from "react";
import { ReactNode } from "react";
import placesAndScreens from "../places_and_screens.test.json";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

export const mockOutletContextData: any = {
  places: placesAndScreens,
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
