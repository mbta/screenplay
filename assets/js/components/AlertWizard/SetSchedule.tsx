import React from "react";

interface SetScheduleProps {
  duration: string | number;
  changeDuration: (event: any) => void;
}

const SetSchedule = (props: SetScheduleProps): JSX.Element => {
  return (
    <>
      <div className="step-instructions flex">
        <div className="hang-left">
          <div className="step-header weight-700">Schedule</div>
          <div>
            Choose an expected play duration. After that, we’ll remind you to
            extend or clear the alert.
          </div>
        </div>
      </div>
      <div className="step-body">
        <div className="info">Duration</div>
        <div className="">
          <select
            className="message-select text-16"
            value={props.duration}
            onChange={props.changeDuration}
          >
            <option value="Open ended">Open ended</option>
            {Array(24)
              .fill(0)
              .map((_: number, index: number) => {
                const plural = index === 0 ? "hour" : "hours";
                return (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} {plural}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
    </>
  );
};

export default SetSchedule;
