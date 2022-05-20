import React, { ReactElement } from "react";
import OutfrontTakeoverTool from "./OutfrontTakeoverTool/OutfrontTakeoverTool";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";

class AppRoutes extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<OutfrontTakeoverTool />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
      </Routes>
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
