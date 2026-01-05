import "../css/app.scss";

import "regenerator-runtime/runtime";

import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";
import * as Sentry from "@sentry/react";
import { FullStory, init as initFullStory } from "@fullstory/browser";
import { fullStoryIntegration } from "@sentry/fullstory";

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
    integrations: [
      fullStoryIntegration(SENTRY_ORG_SLUG, { client: FullStory }),
    ],
  });

  if (username) {
    Sentry.setUser({ username: username });
  }
}

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
