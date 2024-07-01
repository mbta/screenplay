import React, { ReactElement } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ScreenplayProvider } from "../hooks/useScreenplayContext";
import GlEinkWorkflow from "./Dashboard/PermanentConfiguration/Workflows/GlEink/GlEinkWorkflow";

const OutfrontTakeoverTool = React.lazy(
  () => import("./OutfrontTakeoverTool/OutfrontTakeoverTool"),
);
const Dashboard = React.lazy(() => import("./Dashboard/Dashboard"));
const PlacesPage = React.lazy(() => import("./Dashboard/PlacesPage"));
const AlertsPage = React.lazy(() => import("./Dashboard/AlertsPage"));
const AlertDetails = React.lazy(() => import("./Dashboard/AlertDetails"));
const PendingScreensPage = React.lazy(
  () => import("./Dashboard/PendingScreensPage"),
);
const ConfigureScreensPage = React.lazy(
  () => import("./Dashboard/PermanentConfiguration/ConfigureScreensPage"),
);
const SelectScreenTypeComponent = React.lazy(
  () => import("./Dashboard/PermanentConfiguration/SelectScreenType"),
);
const PaMessagesPage = React.lazy(() => import("./Dashboard/PaMessagesPage"));
const NewPaMessagePage = React.lazy(
  () => import("./Dashboard/NewPaMessagePage"),
);

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
            path="*"
            element={
              <ScreenplayProvider>
                <Dashboard />
              </ScreenplayProvider>
            }
          >
            <Route path="dashboard" element={<PlacesPage />}></Route>
            <Route path="alerts" element={<AlertsPage />}></Route>
            <Route path="alerts/:id" element={<AlertDetails />}></Route>
            <Route path="pending" element={<PendingScreensPage />}></Route>
            <Route path="configure-screens" element={<ConfigureScreensPage />}>
              <Route path="*" element={<SelectScreenTypeComponent />} />
              <Route path="gl-eink" element={<GlEinkWorkflow />} />
            </Route>
            <Route path="pa-messages" element={<PaMessagesPage />} />
            <Route path="pa-messages/new" element={<NewPaMessagePage />} />
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
