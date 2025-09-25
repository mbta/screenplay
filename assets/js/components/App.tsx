import React, { ReactElement } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ScreenplayProvider } from "../hooks/useScreenplayContext";
import GlEinkWorkflow from "Components/PermanentConfiguration/Workflows/GlEink/GlEinkWorkflow";
import ErrorModal from "./Dashboard/ErrorModal";

const OutfrontTakeoverTool = React.lazy(
  () => import("./OutfrontTakeoverTool/OutfrontTakeoverTool"),
);
const Dashboard = React.lazy(() => import("Components/Dashboard"));
const PlacesPage = React.lazy(() => import("Components/PlacesPage"));
const AlertsPage = React.lazy(() => import("Components/AlertsPage"));
const AlertDetails = React.lazy(() => import("Components/AlertDetails"));
const PendingScreensPage = React.lazy(
  () => import("Components/PendingScreensPage"),
);
const ConfigureScreensPage = React.lazy(
  () => import("Components/PermanentConfiguration/ConfigureScreensPage"),
);
const SelectScreenTypeComponent = React.lazy(
  () => import("Components/PermanentConfiguration/SelectScreenType"),
);
const PaMessagesPage = React.lazy(() => import("Components/PaMessagesPage"));
const NewPaMessage = React.lazy(() => import("Components/NewPaMessage"));
const EditPaMessage = React.lazy(() => import("Components/EditPaMessage"));
const PredictionSuppressionPage = React.lazy(
  () => import("Components/PredictionSuppressionPage"),
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
            <Route path="pa-messages/new" element={<NewPaMessage />} />
            <Route path="pa-messages/:id/edit" element={<EditPaMessage />} />
            <Route
              path="prediction-suppression"
              element={<PredictionSuppressionPage />}
            />
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
      <ErrorModal />
    </BrowserRouter>
  );
};

export default App;
