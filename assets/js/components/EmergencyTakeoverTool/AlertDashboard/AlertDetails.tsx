import React, { useCallback, useContext } from "react";
import StackedStationCards from "../AlertWizard/StackedStationCards";
import {
  AlertData,
  StationScreenOrientationContext,
} from "../EmergencyTakeoverTool";
import {
  formatDate,
  formatTime,
  getMessageString,
  matchStation,
} from "../../../util";
import { NoSymbolIcon, PencilIcon } from "@heroicons/react/20/solid";
import { ModalDetails } from "../ConfirmationModal";
import AlertReminder from "./AlertReminder";
import AlertPreview from "../AlertWizard/AlertPreview";

interface AlertDetailsProps {
  data: AlertData;
  startEditWizard: (data: AlertData, step: number) => void;
  clearAlert: (id: string) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void;
}

const AlertDetails = (props: AlertDetailsProps): JSX.Element => {
  const {
    data,
    startEditWizard,
    triggerConfirmation,
    clearAlert: clearAlertFromProps,
  } = props;
  const { created_by, id, message, schedule, stations } = data;

  const stationScreenOrientationList = useContext(
    StationScreenOrientationContext,
  );

  const stationDetails = stations.map((station: string) =>
    matchStation(station, stationScreenOrientationList),
  );

  const startDate = new Date(schedule.start);
  const startDateString = formatDate(startDate) + " @ " + formatTime(startDate);

  let endDateString;
  if (schedule.end === null) {
    endDateString = "Open ended";
  } else {
    const endDate = new Date(schedule.end);
    endDateString = formatDate(endDate) + " @ " + formatTime(endDate);
  }

  const editAlert = useCallback(
    (step: number) => startEditWizard(data, step),
    [startEditWizard, data],
  );
  const clearAlert = useCallback(() => {
    const modalDetails: ModalDetails = {
      icon: <NoSymbolIcon className="icon" />,
      header: "Clear Alert",
      description:
        "This stops the Outfront Media screen Takeover, and returns to the regularly scheduled content loop.",
      cancelText: "Keep Alert",
      confirmJSX: (
        <>
          <NoSymbolIcon className="button-icon" />
          Clear Alert
        </>
      ),
      onSubmit: () => clearAlertFromProps(id),
    };
    triggerConfirmation(modalDetails);
  }, [triggerConfirmation, id, clearAlertFromProps]);

  return (
    <div className="alert-card">
      <div className="alert-preview">
        <AlertPreview message={message} where="indoor" />
      </div>
      <div className="alert-details">
        <AlertReminder
          editAlert={editAlert}
          clearAlert={clearAlert}
          endDate={schedule.end}
        />
        <div className="alert-header">
          <StackedStationCards
            stations={stationDetails}
            className="published-alert"
          />
          <button className="edit-button" onClick={() => editAlert(1)}>
            <PencilIcon className="button-icon" />
            Edit
          </button>
          <button className="clear-button" onClick={clearAlert}>
            <NoSymbolIcon className="button-icon" />
            Clear Alert
          </button>
        </div>
        <table className="details-grid">
          <tbody>
            {[
              { where: "indoor" as const, label: "Indoor" },
              { where: "outdoor" as const, label: "Outdoor" },
            ].map(({ where, label }) => (
              <tr key={label}>
                <td>{label} text</td>
                <td className="emphasized-cell">
                  {getMessageString(message, where)}
                </td>
              </tr>
            ))}
            <tr className="gray-row">
              <td>Start</td>
              <td className="emphasized-cell">{startDateString}</td>
            </tr>
            <tr>
              <td>Reminder</td>
              <td className="emphasized-cell">{endDateString}</td>
            </tr>
            <tr className="gray-row">
              <td>Posted by</td>
              <td className="emphasized-cell round-corner">{created_by}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertDetails;
