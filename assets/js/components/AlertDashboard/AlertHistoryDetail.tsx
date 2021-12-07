import React, { useState, useEffect } from "react";
import {
  formatDate,
  formatTime,
  getMessageString,
  matchStation,
} from "../../util";

interface AlertHistoryDetailProps {
  props: any
}

const AlertHistoryDetail = (props: any): JSX.Element => {
  console.log(props)
  const { created_by, id, message, schedule, stations } = props;

  const stationDetails = stations.map(matchStation);
  console.log(stationDetails)
  const startDate = new Date(schedule.start);
  const startDateString = formatDate(startDate) + " @ " + formatTime(startDate);
  const messageString = getMessageString(message);
  let endDateString;
  if (schedule.end === null) {
    endDateString = "Open ended";
  } else {
    const endDate = new Date(schedule.end);
    endDateString = formatDate(endDate) + " @ " + formatTime(endDate);
  }
  return (
    <div className="alert-history-card">
      <div className="alert-details">
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
              <td className="emphasized-cell">{endDateString}  by  {created_by}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistoryDetail;
