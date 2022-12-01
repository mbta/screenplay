import React, { ComponentType } from "react";
import { ArrowRepeat } from "react-bootstrap-icons";
import { formatEffect, translateRouteID } from "../../util";
import { useParams } from "react-router-dom";
import { BannerAlert } from "./Dashboard";

interface Props {
  bannerAlert: BannerAlert;
}

const AlertBanner: ComponentType<Props> = ({ bannerAlert }: Props) => {
  const { alert, closedAt } = bannerAlert;
  if (!alert) return null;

  const wasPosted = alert.created_at === alert.updated_at;
  const params = useParams();

  const getAffectedListString = () => {
    if (alert.affected_list.length === 1) {
      return translateRouteID(alert.affected_list[0]);
    } else if (
      alert.affected_list.every((routeId) => routeId.startsWith("green"))
    ) {
      return "Green Line";
    } else {
      return "";
    }
  };

  const aOrAn = (route: string) => (route === "Orange Line" ? "An" : "A");

  const getBannerText = () => {
    const route = params["*"] || "";

    const affectedListString = getAffectedListString();

    if (
      ["dashboard", "alerts"].includes(route) ||
      (params.id && params.id !== alert.id)
    ) {
      if (closedAt) {
        return (
          <>
            <span className="bold">
              {`${aOrAn(
                affectedListString
              )} ${affectedListString} ${formatEffect(alert.effect)}
              alert was just closed.`}
            </span>{" "}
            Closing an alert may cause others to appear on more screens. It
            could take up to 40 seconds for any impacted screens to update.
          </>
        );
      } else if (wasPosted) {
        return (
          <>
            <span className="bold">
              {`A ${affectedListString} ${formatEffect(alert.effect)}
              alert was just posted.`}
            </span>{" "}
            Posting a new alert may cause others to appear on fewer screens. It
            could take up to 40 seconds for any impacted screens to update.
          </>
        );
      } else {
        return (
          <>
            <span className="bold">
              {`A ${affectedListString} ${formatEffect(alert.effect)}
              alert was just edited.`}
            </span>{" "}
            Some edits may cause other alerts to appear on different screens
            than before. It could take up to 40 seconds for any impacted screens
            to update.
          </>
        );
      }
    } else if (params.id && params.id === alert.id) {
      if (wasPosted) {
        return (
          <>
            <span className="bold">This alert was just posted.</span> It could
            take up to 40 seconds for the alert to be shown all relevant
            screens, and for its list of places to be updated.
          </>
        );
      } else {
        return (
          <>
            <span className="bold">
              This alert was just edited in Alerts UI.
            </span>{" "}
            Some edits may cause this alert or others to appear on different
            screens than before. It could take up to 40 seconds for any impacted
            screens to update.
          </>
        );
      }
    }
  };

  return (
    <div className="alert-banner">
      <div className="alert-banner__icon-container">
        <ArrowRepeat />
      </div>
      <div className="alert-banner__text">{getBannerText()}</div>
    </div>
  );
};

export default AlertBanner;
