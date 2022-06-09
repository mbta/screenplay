import React, { ReactElement } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

const OutfrontTakeoverTool = React.lazy(
  () => import("./OutfrontTakeoverTool/OutfrontTakeoverTool")
);
const Dashboard = React.lazy(() => import("./Dashboard/Dashboard"));

class AppRoutes extends React.Component {
  render() {
    return (
      <React.Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<OutfrontTakeoverTool />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
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
