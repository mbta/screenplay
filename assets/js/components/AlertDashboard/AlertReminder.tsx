import React from "react";
import { ClockIcon } from "@heroicons/react/solid";

const AlertReminder = ({ clearAlert, editAlert, endDate }): JSX.Element => {
  if (!endDate) {
    return null
  }
  
  const endDateObj = new Date(endDate)

  if (new Date() < endDateObj) return null

  return (
    <div className="alert-reminder">
      <ClockIcon className="reminder-icon" />
      <div>
        <span>Reminder that this alert is still posted. Please </span>
        <span className="reminder-action" onClick={editAlert}>Edit</span> 
        <span> for a later reminder, or </span>
        <span className="reminder-action" onClick={clearAlert}>Clear</span> 
        <span> this Alert</span> 
      </div>
    </div>
  )
}

export default AlertReminder;
