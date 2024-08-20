import React from "react";
import { Button } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";

const AlertNotFoundPage = (props: { validAlertId: string | undefined }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="alert-not-found alert-not-found_page">
      <Search size={24} className="alert-not-found_icon" />
      <div>
        <div className="alert-not-found_title">Alert not found</div>
        <p className="alert-not-found_detail">
          {props.validAlertId
            ? `We couldn’t find the alert you’re looking for in Screenplay. This alert \
            (ID #${props.validAlertId}) is open, but it won’t show up on any screens due to \
            its Service Type, Effect Type, or Effect Period.`
            : `We couldn’t find the alert you’re looking for in Screenplay. This could be \
            because the alert has been closed, or because an alert with that ID \
            (#${
              pathname.split("/").slice(-1)[0]
            }) doesn’t exist. You may want to check the Posted Alerts list for it, or double-check the URL. `}
        </p>
        <Button
          className="screenplay-button alert-not-found_button"
          onClick={() => navigate("/alerts", { replace: true })}
        >
          Go to Posted Alerts
        </Button>
      </div>
    </div>
  );
};

export default AlertNotFoundPage;
