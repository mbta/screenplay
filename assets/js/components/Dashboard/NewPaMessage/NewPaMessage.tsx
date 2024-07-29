import React, { useState } from "react";
import moment from "moment";
import { Page } from "./types";
import { Alert } from "Models/alert";

import NewPaMessagePage from "./NewPaMessagePage";
import AssociateAlertPage from "./AssociateAlertPage";

const NewPaMessage = () => {
  const [page, setPage] = useState<Page>(Page.NEW);

  const now = moment();

  const [associatedAlert, setAssociatedAlert] = useState<Alert>({} as Alert);
  const [importLocations, setImportLocations] = useState<boolean>(true);
  const [importMessage, setImportMessage] = useState<boolean>(true);
  const [endWithEffectPeriod, setEndWithEffectPeriod] = useState<boolean>(true);
  const [startDate, setStartDate] = useState(now.format("L"));
  const [startTime, setStartTime] = useState(now.format("HH:mm"));
  const [endDate, setEndDate] = useState(now.format("L"));
  const [endTime, setEndTime] = useState(now.add(1, "hour").format("HH:mm"));
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onClearAssociatedAlert = () => {
    setAssociatedAlert({} as Alert);
    setVisualText("");
    setPhoneticText("");
    setEndWithEffectPeriod(false);
    setImportLocations(false);
    setImportMessage(false);
    setEndDate(now.format("L"));
    setEndTime(now.add(1, "hour").format("HH:mm"));
  };

  return (
    <div className="new-pa-message">
      {page === Page.NEW && (
        <NewPaMessagePage
          {...{
            days,
            endDate,
            endTime,
            errorMessage,
            interval,
            navigateTo: setPage,
            phoneticText,
            priority,
            setDays,
            setEndDate,
            setEndTime,
            setErrorMessage,
            setInterval,
            setPhoneticText,
            setPriority,
            setStartDate,
            setStartTime,
            setVisualText,
            setAssociatedAlert,
            onClearAssociatedAlert,
            setEndWithEffectPeriod,
            setImportLocations,
            setImportMessage,
            startDate,
            startTime,
            visualText,
            associatedAlert,
            endWithEffectPeriod,
          }}
        />
      )}
      {page === Page.ALERTS && (
        <AssociateAlertPage
          associatedAlert={associatedAlert}
          endWithEffectPeriod={endWithEffectPeriod}
          importLocations={importLocations}
          importMessage={importMessage}
          navigateTo={setPage}
          setAssociatedAlert={setAssociatedAlert}
          setEndWithEffectPeriod={setEndWithEffectPeriod}
          setImportLocations={setImportLocations}
          setImportMessage={setImportMessage}
          setVisualText={setVisualText}
        />
      )}
    </div>
  );
};

export default NewPaMessage;
