// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".

import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import * as Sentry from "@sentry/react";
import { FullStory, init as initFullStory } from "@fullstory/browser";
import SentryFullStory from "@sentry/fullstory";

const environment = document
  .querySelector("meta[name=environment-name]")
  ?.getAttribute("content") as string;
const sentryDsn = document
  .querySelector("meta[name=sentry]")
  ?.getAttribute("content");
const username = document
  .querySelector("meta[name=username]")
  ?.getAttribute("content");
const SENTRY_ORG_SLUG = "mbtace";

const fullstoryOrgId = document
  .querySelector("meta[name=fullstory-org-id]")
  ?.getAttribute("content");

if (fullstoryOrgId) {
  initFullStory({ orgId: fullstoryOrgId, recordCrossDomainIFrames: true });

  if (username) {
    FullStory("setIdentity", {
      uid: username,
      properties: { displayName: username },
    });
  }
}

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: environment,
    integrations: [new SentryFullStory(SENTRY_ORG_SLUG, { client: FullStory })],
  });

  if (username) {
    Sentry.setUser({ username: username });
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
