import React from "react";
import StackedStationCards from "../AlertWizard/StackedStationCards";
import {
  formatDate,
  formatTime,
  getMessageString,
  matchStation,
} from "../../../util";
import { AlertData } from "../OutfrontTakeoverTool";

interface PastAlertDetailsProps {
  data: AlertData;
}

const PastAlertDetails = (props: PastAlertDetailsProps): JSX.Element => {
  const { cleared_at, cleared_by, created_by, message, schedule, stations } =
    props.data;

  const stationDetails = stations.map(matchStation);

  const startDate = new Date(schedule.start);
  const clearedDate = new Date(cleared_at);
  const startDateString = formatDate(startDate) + " @ " + formatTime(startDate);
  const clearedDateString =
    formatDate(clearedDate) + " @ " + formatTime(clearedDate);

  const messageString = getMessageString(message);

  return (
    <div className="alert-card">
      <div className="alert-details past-alert">
        <div className="alert-header compact">
          <StackedStationCards
            stations={stationDetails}
            className="published-alert"
          />
        </div>
        <table className="details-grid past-alert">
          <tbody>
            <tr>
              <td>Message text</td>
              <td className="emphasized-cell">{messageString}</td>
            </tr>
            <tr className="gray-row">
              <td>Posted</td>
              <td>
                <span className="emphasized-cell">{startDateString}</span>
                <span className="padded-by-line">by</span>
                <span className="emphasized-cell">{created_by}</span>
              </td>
            </tr>
            <tr>
              <td>Cleared</td>
              <td>
                <span className="emphasized-cell">{clearedDateString}</span>
                <span className="padded-by-line">by</span>
                <span className="emphasized-cell">{cleared_by}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PastAlertDetails;
