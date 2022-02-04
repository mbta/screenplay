import React from "react";
import { ClockIcon } from "@heroicons/react/solid";

interface AlertReminderProps {
  clearAlert: () => void;
  editAlert: (step: number) => void;
  endDate: string | null;
}

const AlertReminder = ({
  clearAlert,
  editAlert,
  endDate,
}: AlertReminderProps): JSX.Element | null => {
  if (!endDate) return null;
  const endDateObj = new Date(endDate);
  if (new Date() < endDateObj) return null;

  return (
    <div className="alert-reminder">
      <ClockIcon className="reminder-icon" />
      <div>
        <span>Reminder that this alert is still posted. Please </span>
        <span className="reminder-action" onClick={() => editAlert(3)}>
          Edit
        </span>
        <span> for a later reminder, or </span>
        <span className="reminder-action" onClick={clearAlert}>
          Clear
        </span>
        <span> this Alert</span>
      </div>
    </div>
  );
};

export default AlertReminder;
