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

const environment = document
  .querySelector("meta[name=environment-name]")
  ?.getAttribute("content") as string;
const sentryDsn = document
  .querySelector("meta[name=sentry]")
  ?.getAttribute("content");
const username = document
  .querySelector("meta[name=username]")
  ?.getAttribute("content");

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: environment,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  if (username) {
    Sentry.setUser({ username: username });
  }
}

const fullstoryOrgId = document
  .querySelector("meta[name=fullstory-org-id]")
  ?.getAttribute("content");

if (fullstoryOrgId) {
  FullStory.init({ orgId: fullstoryOrgId, recordCrossDomainIFrames: true });
}

ReactDOM.render(<App />, document.getElementById("app"));
