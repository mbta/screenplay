import React from "react";
import { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ScreenplayProvider } from "../../js/hooks/useScreenplayContext";
import Dashboard from "../../js/components/Dashboard/Dashboard";
import { render } from "@testing-library/react";

export const renderWithScreenplayProvider = (children: ReactNode) => {
  return render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ScreenplayProvider>
              <Dashboard />
            </ScreenplayProvider>
          }
        >
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};
