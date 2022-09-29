import React, { ReactElement, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";

const OutfrontTakeoverTool = React.lazy(
  () => import("./OutfrontTakeoverTool/OutfrontTakeoverTool")
);
const Dashboard = React.lazy(() => import("./Dashboard/Dashboard"));

class AppRoutes extends React.Component {
  render() {
    return (
      <React.Suspense fallback={<></>}>
        <Routes>
          <Route
            path="/emergency-takeover"
            element={<OutfrontTakeoverTool />}
          ></Route>
          <Route
            path="/dashboard"
            element={<Dashboard page="places" />}
          ></Route>
          <Route
            path="/dashboard/alerts"
            element={<Dashboard page="alerts" />}
          ></Route>
        </Routes>
      </React.Suspense>
    );
  }
}

const App = (): ReactElement<HTMLDivElement> => {
  const sentryDsn = document.getElementById("app")?.dataset.sentry;
  useEffect(() => {
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
      });
    }
  }, [sentryDsn]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
