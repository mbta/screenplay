import React, { useState } from "react";
import moment, { type Moment } from "moment";
import { Page } from "./types";
import NewPaMessagePage from "./NewPaMessagePage";
import AssociateAlertPage from "./AssociateAlertPage";
import { Alert, InformedEntity } from "Models/alert";
import SelectStationsAndZones from "./StationsAndZones/SelectStationsAndZones";
import { usePlacesWithPaEss } from "Hooks/usePlacesWithPaEss";
import ErrorToast from "Components/ErrorToast";
import { PaMessage } from "Models/pa_message";
import { createNewPaMessage } from "Utils/api";
import { useNavigate } from "react-router-dom";
import { busRouteIdsAtPlaces, getRouteIdsForSign } from "../../../util";
import fp from "lodash/fp";

const NewPaMessage = () => {
  const [page, setPage] = useState<Page>(Page.NEW);
  const now = moment();

  const [associatedAlert, setAssociatedAlert] = useState<Alert>({} as Alert);
  const [endWithEffectPeriod, setEndWithEffectPeriod] =
    useState<boolean>(false);
  const [startDateTime, setStartDateTime] = useState(now);
  const [endDateTime, setEndDateTime] = useState<Moment>(
    moment(now).add(1, "hour"),
  );
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

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

  const onImportLocations = (informedEntities: InformedEntity[]) => {
    const importedSigns = informedEntities.flatMap((entity) => {
      const informedPlaces = entity.stop
        ? places.filter((place) => place.id === entity.stop)
        : places;

      if (entity.route) {
        const entityRoute = entity.route;
        let signsToAdd = informedPlaces
          .flatMap((place) => place.screens)
          .filter((screen) => getRouteIdsForSign(screen).includes(entityRoute));

        const directionId = entity.direction_id;
        if (directionId !== null) {
          signsToAdd = signsToAdd.filter((screen) =>
            screen.routes
              ?.map((route) => route.direction_id)
              .includes(directionId),
          );
        }

        return signsToAdd.map((screen) => screen.id);
      }

      return [];
    });

    setSignIds(fp.uniq(importedSigns));
  };

  const navigate = useNavigate();
  const onSubmit = async () => {
    const newMessage: PaMessage = {
      alert_id: associatedAlert.id,
      start_time: startDateTime.toISOString(),
      end_time: endWithEffectPeriod ? null : endDateTime.toISOString(),
      days_of_week: days,
      sign_ids: signIds,
      priority,
      interval_in_minutes: Number(interval),
      visual_text: visualText,
      audio_text: phoneticText,
    };

    const { status, errors } = await createNewPaMessage(newMessage);

    if (status === 200) {
      navigate("/pa-messages");
    } else if (status === 422) {
      setErrorMessage("Correct the following errors:");
      setErrors(Object.keys(errors));
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

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
            onSubmit,
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
      <ErrorToast
        errorMessage={errorMessage}
        errors={errors}
        onClose={() => {
          setErrors([]);
          setErrorMessage("");
        }}
      />
    </div>
  );
};

export default NewPaMessage;
