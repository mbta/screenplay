import React, { ComponentType, useEffect, useState } from "react";
import { ArrowRepeat, CheckCircleFill } from "react-bootstrap-icons";
import { formatEffect, translateRouteID } from "../../util";
import { useParams } from "react-router-dom";
import {
  useScreenplayContext,
  useScreenplayDispatchContext,
} from "../../hooks/useScreenplayContext";
import { Alert } from "../../models/alert";

interface BannerAlert {
  alert: Alert;
  type: "postedOrEdited" | "closed";
  startedAt: Date;
}

interface AlertBannerProps {
  isDone: boolean;
  queueExpiration: () => void;
}

const AlertBanner: ComponentType<AlertBannerProps> = ({
  isDone,
  queueExpiration,
}: AlertBannerProps) => {
  const { bannerAlert } = useScreenplayContext();
  if (!bannerAlert) return null;

  const { alert, type, startedAt } = bannerAlert as BannerAlert;

  const [timeLeft, setTimeLeft] = useState(40);

  // Banner should expire 40s after the most recent alert change (closed/updated)
  useEffect(() => {
    const bannerExpireTime = new Date(startedAt).getTime() + 40 * 1000;
    const now = new Date().getTime();
    const secondsLeft = Math.floor(
      ((bannerExpireTime - now) % (1000 * 60)) / 1000
    );

    setTimeLeft(secondsLeft);
  }, [bannerAlert]);

  // Every second, decrement the seconds left
  useEffect(() => {
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timeLeft]);

  const wasPosted = alert.created_at === alert.updated_at;
  const params = useParams();

  const getAffectedListString = () => {
    if (alert.affected_list.length === 1) {
      return translateRouteID(alert.affected_list[0]);
    } else if (
      alert.affected_list.every((routeId: string) =>
        routeId.startsWith("green")
      )
    ) {
      return "Green Line";
    } else {
      return "";
    }
  };

  const aOrAn = (route: string) => (route === "Orange Line" ? "An" : "A");

  const getBannerText = () => {
    // When isDone is true, banner should show a "Finished Updating" state for 5 seconds.
    // After the 5 seconds is up, close the banner.
    if (isDone) {
      queueExpiration();

      return (
        <span className="bold">Screens and places have finished updating</span>
      );
    }

    const route = (params["*"] || "").replace(/\//g, "");

    const affectedListString = getAffectedListString();

    const plural = timeLeft === 1 ? "second" : "seconds";

    if (
      ["dashboard", "alerts"].includes(route) ||
      (params.id && params.id !== alert.id)
    ) {
      if (type === "closed") {
        return (
          <>
            <span className="bold">
              {`${aOrAn(
                affectedListString
              )} ${affectedListString} ${formatEffect(alert.effect)}
              alert was just closed.`}
            </span>{" "}
            Closing an alert may cause others to appear on more screens. It
            could take up to {timeLeft} {plural} for any impacted screens to
            update.
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
            could take up to {timeLeft} {plural} for any impacted screens to
            update.
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
            than before. It could take up to {timeLeft} {plural} for any
            impacted screens to update.
          </>
        );
      }
    } else if (params.id && params.id === alert.id) {
      if (wasPosted) {
        return (
          <>
            <span className="bold">This alert was just posted.</span> It could
            take up to {timeLeft} {plural} for the alert to be shown all
            relevant screens, and for its list of places to be updated.
          </>
        );
      } else {
        return (
          <>
            <span className="bold">
              This alert was just edited in Alerts UI.
            </span>{" "}
            Some edits may cause this alert or others to appear on different
            screens than before. It could take up to {timeLeft} {plural} for any
            impacted screens to update.
          </>
        );
      }
    }
  };

  return (
    <div className="alert-banner">
      <div className="alert-banner__icon-container">
        {isDone ? (
          <CheckCircleFill className="alert-banner__check-icon" />
        ) : (
          <ArrowRepeat />
        )}
      </div>
      <div className="alert-banner__text">{getBannerText()}</div>
    </div>
  );
};

export { BannerAlert };
export default AlertBanner;
