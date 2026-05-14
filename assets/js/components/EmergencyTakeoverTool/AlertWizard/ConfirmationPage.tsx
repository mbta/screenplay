import React from "react";
import { formatDate, formatTime } from "../../../util";
import StackedStationCards from "./StackedStationCards";
import { Station } from "../EmergencyTakeoverTool";
import { getMessageString, Message } from "Utils/emergencyMessages";

interface ConfirmationPageProps {
  goToStep: (step: number) => void;
  selectedStations: Station[];
  message: Message;
  duration: number | string;
}

const ConfirmationPage = (props: ConfirmationPageProps): JSX.Element => {
  let durationString = "",
    expirationString = "",
    expirationTime = "";
  if (typeof props.duration === "number") {
    durationString =
      props.duration === 1 ? "1 hour" : props.duration + " hours";

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + props.duration);
    expirationString = formatDate(expirationDate);
    expirationTime = formatTime(expirationDate);
  }

  return (
    <>
      <div className="step-instructions flex">
        <div className="hang-left">
          <div className="step-header weight-700">Confirm</div>
          <div>Double check that all information is correct</div>
        </div>
      </div>
      <table className="details-grid">
        <tbody>
          {[
            { location: "indoor" as const, label: "Indoor" },
            { location: "outdoor" as const, label: "Outdoor" },
          ].map(({ location, label }) => (
            <tr key={label} className="gray-row">
              <td>{label} text</td>
              <td className="emphasized-cell">
                {getMessageString(props.message, location)}
              </td>
              <td>
                <div className="edit-link" onClick={() => props.goToStep(1)}>
                  Edit
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td>Stations</td>
            <td>
              <StackedStationCards
                stations={props.selectedStations}
                className="confirmation"
              />
            </td>
            <td>
              <div className="edit-link" onClick={() => props.goToStep(2)}>
                Edit
              </div>
            </td>
          </tr>
          <tr className="gray-row">
            <td>Expiration</td>
            <td className="emphasized-cell">
              {props.duration === "Open ended" ? (
                "Open ended"
              ) : (
                <div>
                  {durationString} → {expirationString} @ {expirationTime}
                </div>
              )}
            </td>
            <td>
              <div className="edit-link" onClick={() => props.goToStep(3)}>
                Edit
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ConfirmationPage;
