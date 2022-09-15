import React, { ComponentType } from "react";
import classNames from "classnames";

interface Props {
  isVisible: boolean;
}

const AlertsPage: ComponentType<Props> = (props) => {
  return (
    <div className={classNames("alerts-page", { "alerts-page--hidden": !props.isVisible })}>
      <div className="page-content__header">Posted Alerts</div>
      <div className="page-content__body">
        <div style={{ color: "white" }}>This will be posted alerts</div>
      </div>
    </div>
  );
};

export default AlertsPage;
