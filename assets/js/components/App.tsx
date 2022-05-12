import React from "react";
import OutfrontTakeoverTool from "./OutfrontTakeoverTool/OutfrontTakeoverTool";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";

class App extends React.Component {
  render() {
    return (
      <Routes>
        <Route path="/" element={<OutfrontTakeoverTool />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
      </Routes>
    );
  }
}

export default App;
