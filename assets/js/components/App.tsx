import React from "react";
import OutfrontTakeoverTool from "./OutfrontTakeoverTool/OutfrontTakeoverTool";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";

interface AppProps {
  name: string;
}

interface AppState {}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
  }

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
