import React, { ReactElement } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { initClarityAnalytics } from "../utils/clarityInit";

const OutfrontTakeoverTool = React.lazy(
  () => import("./OutfrontTakeoverTool/OutfrontTakeoverTool")
);
const Dashboard = React.lazy(() => import("./Dashboard/Dashboard"));
const PlacesPage = React.lazy(() => import("./Dashboard/PlacesPage"));
const AlertsPage = React.lazy(() => import("./Dashboard/AlertsPage"));
const AlertDetails = React.lazy(() => import("./Dashboard/AlertDetails"));
const clarityTag = document
  .querySelector("meta[name=clarity-tag]")
  ?.getAttribute("content");

if (clarityTag) {
  initClarityAnalytics(clarityTag);
}

class AppRoutes extends React.Component {
  render() {
    return (
      <React.Suspense fallback={<></>}>
        <Routes>
          <Route
            path="/emergency-takeover"
            element={<OutfrontTakeoverTool />}
          ></Route>
          <Route path="*" element={<Dashboard />}>
            <Route path="dashboard" element={<PlacesPage />}></Route>
            <Route path="alerts" element={<AlertsPage />}></Route>
            <Route path="alerts/:id" element={<AlertDetails />}></Route>
          </Route>
        </Routes>
      </React.Suspense>
    );
  }
}

const App = (): ReactElement<HTMLDivElement> => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
