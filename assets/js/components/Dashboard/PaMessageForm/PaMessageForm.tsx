import React, { useState } from "react";
import moment, { type Moment } from "moment";
import MainForm from "./MainForm";
import { Page } from "./types";
import SelectStationsAndZones from "./SelectStationsAndZones";
import AssociateAlert from "./AssociateAlert";
import { Alert, InformedEntity } from "Models/alert";
import { usePlacesWithPaEss } from "Hooks/usePlacesWithPaEss";
import ErrorToast from "Components/ErrorToast";
import { busRouteIdsAtPlaces, getRouteIdsForSign } from "../../../util";
import fp from "lodash/fp";

interface PaMessageFormData {
  alert_id: string | null;
  start_datetime: string;
  end_datetime: string | null;
  days_of_week: number[];
  sign_ids: string[];
  priority: number;
  interval_in_minutes: number;
  visual_text: string;
  audio_text: string;
}

interface Props {
  title: string;
  onSubmit: (data: PaMessageFormData) => any;
  onError: (message: string | null) => void;
  onErrorsChange: (errors: string[]) => void;
  errorMessage: string | null;
  errors: string[];
}

const PaMessageForm = ({
  title,
  errorMessage,
  errors,
  onError,
  onErrorsChange,
  onSubmit,
}: Props) => {
  const [page, setPage] = useState<Page>(Page.MAIN);
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

  return (
    <div className="new-pa-message">
      {page === Page.MAIN && (
        <MainForm
          onSubmit={() => {
            const formData: PaMessageFormData = {
              alert_id: associatedAlert.id,
              start_datetime: startDateTime.toISOString(),
              end_datetime: endWithEffectPeriod
                ? null
                : endDateTime.toISOString(),
              days_of_week: days,
              sign_ids: signIds,
              priority,
              interval_in_minutes: Number(interval),
              visual_text: visualText,
              audio_text: phoneticText,
            };

            onSubmit(formData);
          }}
          {...{
            title,
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
            onError,
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
            onError={onError}
          />
        </div>
      )}
      {page === Page.ALERTS && (
        <AssociateAlert
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
          onErrorsChange([]);
          onError(null);
        }}
      />
    </div>
  );
};

export default PaMessageForm;
