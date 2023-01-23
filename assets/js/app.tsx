// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";

import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import * as Sentry from "@sentry/react";
import * as FullStory from "@fullstory/browser";

const sentryDsn = document
  .querySelector("meta[name=sentry]")
  ?.getAttribute("content");
const username = document
  .querySelector("meta[name=username]")
  ?.getAttribute("content");

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
  });

  if (username) {
    Sentry.setUser({ username: username });
  }
}

const fullstoryOrgId = document
  .querySelector("meta[name=fullstory-org-id]")
  ?.getAttribute("content");

if (fullstoryOrgId && !FullStory.isInitialized()) {
  FullStory.init({ orgId: fullstoryOrgId });
}

ReactDOM.render(<App />, document.getElementById("app"));
