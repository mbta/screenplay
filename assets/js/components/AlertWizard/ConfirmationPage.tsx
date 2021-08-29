import React from "react";
import { Station } from "../../constants/stations";
import StackedStationCards from "./StackedStationCards";

interface ConfirmationPageProps {
  goToStep: (step: number) => void;
  selectedStations: Station[];
  message: string;
  duration: number | string;
}

const ConfirmationPage = (props: ConfirmationPageProps): JSX.Element => {
  let durationString: string = "",
    expirationString: string = "",
    expirationTime: string = "";
  if (typeof props.duration === "number") {
    durationString =
      props.duration === 1 ? "1 hour" : props.duration + " hours";

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + props.duration);
    console.log("expiration: ", expirationDate);
    expirationString = expirationDate.toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
    });
    expirationTime = new Intl.DateTimeFormat(undefined, {
      timeStyle: "short",
    }).format(expirationDate);
  }

  return (
    <>
      <div className="step-instructions flex">
        <div className="hang-left">
          <div className="step-header weight-700">Confirm</div>
          <div>Double check that all information is correct</div>
        </div>
      </div>
      <table className="confirmation-grid">
        <tbody>
          <tr className="gray-row">
            <td>Message text</td>
            <td className="emphasized-cell">{props.message}</td>
            <td>
              <div className="edit-link" onClick={() => props.goToStep(1)}>
                Edit
              </div>
            </td>
          </tr>
          <tr>
            <td>Stations</td>
            <td>
              <StackedStationCards
                selectedStations={props.selectedStations}
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
