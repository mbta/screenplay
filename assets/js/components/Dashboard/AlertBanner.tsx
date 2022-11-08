import React, { ComponentType } from "react";
import { Alert } from "../../models/alert";
import { ArrowRepeat } from "react-bootstrap-icons";
import {
  convertArrayToListString,
  formatEffect,
  translateRouteID,
} from "../../util";

interface Props {
  alert: Alert;
}

const AlertBanner: ComponentType<Props> = ({ alert }: Props) => {
  const wasCreated = alert.created_at === alert.updated_at;
  const getAffectedListString = () => {
    const translatedAffectList = alert.affected_list.map((routeId) =>
      translateRouteID(routeId)
    );

    return convertArrayToListString(translatedAffectList);
  };
  const getInfoSentence = () => {
    if (wasCreated) {
      return "Posting a new alert may cause others to appear on fewer screens.";
    } else {
      return "Some edits may cause other alerts to appear on different screens than before.";
    }
  };
  return (
    <div className="alert-banner">
      <div className="alert-banner__icon-container">
        <ArrowRepeat />
      </div>
      <div className="alert-banner__text">
        <span className="bold">
          A {getAffectedListString()} {formatEffect(alert.effect)} alert was
          just {wasCreated ? "posted" : "edited"}.
        </span>{" "}
        {getInfoSentence()} It could take up to{" "}
        <span className="bold">2 minutes</span> for any impacted screens to
        update.{" "}
      </div>
    </div>
  );
};

export default AlertBanner;
