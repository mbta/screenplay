import React from "react";
import OutfrontTakeoverTool from "./OutfrontTakeoverTool/OutfrontTakeoverTool";
import { Routes, Route, Outlet, Link } from "react-router-dom";

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
      </Routes>
    );
  }
}

export default App;
