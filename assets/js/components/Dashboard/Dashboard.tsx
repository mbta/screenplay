import React, { useState } from "react";
import "../../../css/screenplay.scss";
import Sidebar from "./Sidebar";
import Places from "./Places";
import Alerts from "./Alerts";
import classNames from "classnames";

const Dashboard = (): JSX.Element => {
  const [page, setPage] = useState<string>("places");

  const handlePageChange = (pageName: string) => {
    setPage(pageName);
  };

  return (
    <div className="screenplay-container">
      <Sidebar handlePageChange={handlePageChange} />
      <div
        className={classNames("page-content", {
          "page-content__hidden": page !== "places",
        })}
      >
        <div className="page-content__header">Places</div>
        <div className="page-content__body">
          <Places />
        </div>
      </div>
      <div
        className={classNames("page-content", {
          "page-content__hidden": page !== "alerts",
        })}
      >
        <div className="page-content__header">Posted Alerts</div>
        <div className="page-content__body">
          <Alerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
