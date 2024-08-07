import React, { useState } from "react";
import moment, { type Moment } from "moment";
import { Page } from "./types";
import NewPaMessagePage from "./NewPaMessagePage";
import AssociateAlertPage from "./AssociateAlertPage";
import { Alert } from "Models/alert";
import SelectStationsAndZones from "./StationsAndZones/SelectStationsAndZones";
import { usePlacesWithPaEss } from "Hooks/usePlacesWithPaEss";
import { busRouteIdsAtPlaces } from "../../../util";
import { Alert as AlertToast } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";

const NewPaMessage = () => {
  const [page, setPage] = useState<Page>(Page.NEW);
  const now = moment();

  const [associatedAlert, setAssociatedAlert] = useState<Alert>({} as Alert);
  const [endWithEffectPeriod, setEndWithEffectPeriod] =
    useState<boolean>(false);
  const [startDateTime, setStartDateTime] = useState(now);
  const [endDateTime, setEndDateTime] = useState<Moment | null>(
    now.add(1, "hour"),
  );
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signIds, setSignIds] = useState<string[]>([]);
  const places = usePlacesWithPaEss();
  const busRoutes = busRouteIdsAtPlaces(places);

  const onClearAssociatedAlert = () => {
    setEndDateTime(moment(startDateTime).add(1, "hour"));
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
            interval,
            navigateTo: setPage,
            phoneticText,
            priority,
            setDays,
            startDateTime,
            setStartDateTime,
            endDateTime,
            setEndDateTime,
            setErrorMessage,
            setInterval,
            setPhoneticText,
            setPriority,
            setVisualText,
            setAssociatedAlert,
            onClearAssociatedAlert,
            setEndWithEffectPeriod,
            visualText,
            associatedAlert,
            endWithEffectPeriod,
            signIds,
            setSignIds,
            places,
            busRoutes,
          }}
        />
      )}
      {[Page.STATIONS, Page.ZONES].includes(page) && (
        <div className="select-station-and-zones-container">
          <SelectStationsAndZones
            places={places}
            value={signIds}
            onChange={setSignIds}
            page={page}
            navigateTo={setPage}
            busRoutes={busRoutes}
            onError={(message: string) => setErrorMessage(message)}
          />
        </div>
      )}
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
      <div className="error-alert-container">
        <AlertToast
          show={errorMessage.length > 0}
          variant="primary"
          onClose={() => setErrorMessage("")}
          dismissible
          className="error-alert"
        >
          <ExclamationTriangleFill className="error-alert__icon" />
          <div className="error-alert__text">{errorMessage}</div>
        </AlertToast>
      </div>
    </div>
  );
};

export default NewPaMessage;
