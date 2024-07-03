import React, { useCallback, useContext } from "react";
import StackedStationCards from "../AlertWizard/StackedStationCards";
import {
  AlertData,
  StationScreenOrientationContext,
} from "../OutfrontTakeoverTool";
import {
  formatDate,
  formatTime,
  getMessageString,
  matchStation,
} from "../../../util";
import { BanIcon, PencilIcon } from "@heroicons/react/20/solid";
import { ModalDetails } from "../ConfirmationModal";
import SVGPreviews from "../AlertWizard/SVGPreviews";
import AlertReminder from "./AlertReminder";

interface AlertDetailsProps {
  data: any;
  setLastChangeTime: (time: number) => void;
  startEditWizard: (data: AlertData, step: number) => void;
  clearAlert: (id: string, setLastChangeTime: (time: number) => void) => void;
  triggerConfirmation: (modalDetails: ModalDetails) => void;
}

const AlertDetails = (props: AlertDetailsProps): JSX.Element => {
  const { data, setLastChangeTime, startEditWizard, triggerConfirmation } =
    props;
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

  const messageString = getMessageString(message);

  const modalDetails: ModalDetails = {
    icon: <BanIcon className="icon" />,
    header: "Clear Alert",
    description:
      "This stops the Outfront Media screen Takeover, and returns to the regularly scheduled content loop.",
    cancelText: "Keep Alert",
    confirmJSX: (
      <>
        <BanIcon className="button-icon" />
        Clear Alert
      </>
    ),
    onSubmit: () => props.clearAlert(id, setLastChangeTime),
  };

  const editAlert = useCallback(
    (step: number) => startEditWizard(data, step),
    [startEditWizard, data],
  );
  const clearAlert = useCallback(
    () => triggerConfirmation(modalDetails),
    [triggerConfirmation, modalDetails],
  );

  return (
    <div className="alert-card">
      <div className="alert-preview">
        {message.id === undefined ? (
          <SVGPreviews showText={true} message={messageString} />
        ) : (
          <img
            className="portrait-png"
            src={`/images/Outfront-Alert-${message.id}-portrait.png`}
            alt=""
          />
        )}
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
            <BanIcon className="button-icon" />
            Clear Alert
          </button>
        </div>
        <table className="details-grid">
          <tbody>
            <tr>
              <td>Message text</td>
              <td className="emphasized-cell">{messageString}</td>
            </tr>
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
