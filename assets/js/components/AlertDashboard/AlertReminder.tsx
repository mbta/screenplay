import React from "react";

const AlertReminder = ({ clearAlert, editAlert, endDate }): JSX.Element => {
  if (!endDate) {
    return null
  }
  
  const endDateObj = new Date(endDate)

  if (new Date() < endDateObj) return null

  return (
    <div>
      <p>Reminder that this alert is still posted. Please <span onClick={editAlert}>Edit</span> for a later reminder, or <span onClick={clearAlert}>Clear</span> this Alert</p> 
    </div>
  )
}

export default AlertReminder