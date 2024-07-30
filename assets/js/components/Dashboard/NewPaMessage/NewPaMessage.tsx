import React, { useState } from "react";
import moment from "moment";
import { Page } from "./types";

import NewPaMessagePage from "./NewPaMessagePage";
import AssociateAlertPage from "./AssociateAlertPage";
import { Alert } from "Models/alert";
import SelectStationsAndZones from "./StationsAndZones/SelectStationsAndZones";
import { usePlacesWithPaEss } from "./hooks";
import { Modal } from "react-bootstrap";

const NewPaMessage = () => {
  const [page, setPage] = useState<Page>(Page.NEW);
  const now = moment();

  const [associatedAlert, setAssociatedAlert] = useState<Alert>({} as Alert);
  const [endWithEffectPeriod, setEndWithEffectPeriod] =
    useState<boolean>(false);
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
  const [signIds, setSignIds] = useState<string[]>([]);
  const places = usePlacesWithPaEss();

  const onClearAssociatedAlert = () => {
    setAssociatedAlert({} as Alert);
    setEndWithEffectPeriod(false);
  };

  const onImportMessage = (alertMessage: string) => {
    setVisualText(alertMessage);
  };

  const onImportLocations = () => {};

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
            startDate,
            startTime,
            visualText,
            associatedAlert,
            endWithEffectPeriod,
          }}
        />
      )}
      <Modal
        className="select-stations-page-modal"
        fullscreen
        show={[Page.STATIONS, Page.ZONES].includes(page)}
        onHide={() => setPage(Page.NEW)}
      >
        <SelectStationsAndZones
          places={places}
          value={signIds}
          onChange={setSignIds}
          page={page}
          navigateTo={setPage}
        />
      </Modal>
      {page === Page.ALERTS && (
        <AssociateAlertPage
          associatedAlert={associatedAlert}
          endWithEffectPeriod={endWithEffectPeriod}
          onImportMessage={onImportMessage}
          onImportLocations={onImportLocations}
          navigateTo={setPage}
          setAssociatedAlert={setAssociatedAlert}
          setEndWithEffectPeriod={setEndWithEffectPeriod}
        />
      )}
    </div>
  );
};

export default NewPaMessage;
