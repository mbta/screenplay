import React, { useCallback, useContext } from "react";
import StackedStationCards from "../AlertWizard/StackedStationCards";
import {
  AlertData,
  StationScreenOrientationContext,
} from "../EmergencyTakeoverTool";
import { CannedMessagesContext } from "../CannedMessagesContext";
import { formatDate, formatTime, matchStation } from "../../../util";
import { NoSymbolIcon, PencilIcon } from "@heroicons/react/20/solid";
import { ModalDetails } from "../ConfirmationModal";
import AlertReminder from "./AlertReminder";
import AlertPreview from "../AlertWizard/AlertPreview";
import {
  fullCannedMessageDetails,
  getMessageString,
} from "Utils/emergencyMessages";

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

  const stationsAndScreens = useContext(StationScreenOrientationContext);
  const stationDetails = stations.map((station: string) =>
    matchStation(station, stationsAndScreens),
  );

  const { messages: cannedMessages } = useContext(CannedMessagesContext);
  const messageDetails =
    message.type === "custom"
      ? message
      : fullCannedMessageDetails(message, cannedMessages);

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
        "This stops the Emergency Takeover and returns to regularly scheduled content.",
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
        <AlertPreview message={messageDetails} location="indoor" />
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
              { location: "indoor" as const, label: "Indoor" },
              { location: "outdoor" as const, label: "Outdoor" },
            ].map(({ location, label }) => (
              <tr key={label}>
                <td>{label} text</td>
                <td className="emphasized-cell">
                  {getMessageString(messageDetails, location)}
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
