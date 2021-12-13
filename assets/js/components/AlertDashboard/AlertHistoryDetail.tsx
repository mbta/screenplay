import React, { useState, useEffect } from "react";
import {
  formatDate,
  formatTime,
  getMessageString,
  matchStation,
} from "../../util";
import StackedStationCards from "../AlertWizard/StackedStationCards";

interface AlertHistoryDetailProps {
  props: any
}

const AlertHistoryDetail = (props: any): JSX.Element => {
  console.log(props)
  const { cleared_at, cleared_by, created_by, id, message, schedule, stations } = props;

  const stationDetails = stations.map(matchStation);
  console.log(stationDetails)
  const startDate = new Date(schedule.start);
  const startDateString = formatDate(startDate) + " @ " + formatTime(startDate);
  const clearedDate = new Date(cleared_at);
  const clearedDateString = formatDate(clearedDate) + " @ " + formatTime(clearedDate);
  const messageString = getMessageString(message);

  return (
    <div className="alert-history-card">
      <div className="alert-details">
        <div className="alert-header">
          <StackedStationCards stations={stationDetails} className={"published-alert"} />
        </div>
        <table className="details-grid confirmation">
          <tbody>
            <tr>
              <td>Message text</td>
              <td className="emphasized-cell">{messageString}</td>
            </tr>
            <tr className="gray-row">
              <td>Posted</td>
              <td className="emphasized-cell">{startDateString}  by  {created_by}</td>
            </tr>
            <tr>
              <td>Cleared</td>
              <td className="emphasized-cell">{clearedDateString}  by  {cleared_by}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistoryDetail;
