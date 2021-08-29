import React from 'react';
import { AlertData } from "../App"

interface AlertDetailsProps {
  data: any;
  setLastChangeTime: (time: number) => void;
  startEditWizard: (data: AlertData) => void;
}

const clearAlert = (id: string, setLastChangeTime: (time: number) => void) => {
  const csrfMetaElement = document.head.querySelector("[name~=csrf-token][content]") as HTMLMetaElement
  const csrfToken = csrfMetaElement.content
  const data = { id }

  fetch("/api/clear", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    credentials: "include",
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      return response.json()
    })
    .then(({success}) => {
      if (success) {
        setLastChangeTime(Date.now())
      } else {
        // Should this be a toast or other user-visible message?
        console.log('Error when clearing with id: ', id)
      }
    })
    .catch((error) => {
      // Should this be a toast or other user-visible message?
      console.log('Failed to clear alert: ', error)
    })
}

const AlertDetails = (props: AlertDetailsProps): JSX.Element => {
  const {data, setLastChangeTime, startEditWizard} = props;
  const {id, message, stations} = data;

  return <tr>
    <td>{id}</td>
    <td>{stations.join(", ")}</td>
    <td onClick={() => startEditWizard(data)}>edit</td>
    <td onClick={() => clearAlert(id, setLastChangeTime)}>clear</td>
  </tr>
}

export default AlertDetails;
