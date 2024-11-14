import React, { useEffect, useState } from "react";
import moment, { type Moment } from "moment";
import MainForm from "./MainForm";
import { AudioPreview, Page } from "./types";
import SelectStationsAndZones from "./SelectStationsAndZones";
import AssociateAlert from "./AssociateAlert";
import StaticTemplatePage from "./StaticTemplatePage";
import { Alert, InformedEntity } from "Models/alert";
import { usePlacesWithPaEss } from "Hooks/usePlacesWithPaEss";
import Toast from "Components/Toast";
import { busRouteIdsAtPlaces, getRouteIdsForSign } from "../../../util";
import fp from "lodash/fp";
import { StaticTemplate } from "Models/static_template";

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
  defaultValues?: Partial<PaMessageFormData>;
  defaultAlert?: Alert | string | null;
  defaultAudioState?: AudioPreview;
  paused: boolean;
}

const PaMessageForm = ({
  title,
  errorMessage,
  errors,
  onError,
  onErrorsChange,
  onSubmit,
  defaultValues,
  defaultAlert,
  defaultAudioState,
  paused,
}: Props) => {
  const [page, setPage] = useState<Page>(Page.MAIN);
  const now = moment();

  const [associatedAlert, setAssociatedAlert] = useState<Alert | string | null>(
    () => {
      if (defaultAlert) return defaultAlert;
      return null;
    },
  );
  const [endWithEffectPeriod, setEndWithEffectPeriod] = useState<boolean>(
    () => {
      if (defaultAlert && defaultValues?.end_datetime === null) return true;
      return false;
    },
  );
  const [startDateTime, setStartDateTime] = useState(() => {
    if (defaultValues?.start_datetime)
      return moment(defaultValues.start_datetime);
    return now;
  });
  const [endDateTime, setEndDateTime] = useState<Moment>(() => {
    if (defaultValues?.end_datetime) return moment(defaultValues.end_datetime);
    return moment(now).add(1, "hour");
  });
  const [days, setDays] = useState(() => {
    return defaultValues?.days_of_week ?? [1, 2, 3, 4, 5, 6, 7];
  });
  const [priority, setPriority] = useState(() => {
    return defaultValues?.priority ?? 2;
  });
  const [interval, setInterval] = useState(() => {
    return defaultValues?.interval_in_minutes
      ? `${defaultValues?.interval_in_minutes}`
      : "4";
  });
  const [visualText, setVisualText] = useState(
    defaultValues?.visual_text ?? "",
  );
  const [phoneticText, setPhoneticText] = useState(
    defaultValues?.audio_text ?? "",
  );

  const [signIds, setSignIds] = useState<string[]>(() => {
    return defaultValues?.sign_ids ?? [];
  });
  const places = usePlacesWithPaEss();
  const busRoutes = busRouteIdsAtPlaces(places);

  const [audioState, setAudioState] = useState<AudioPreview>(
    () => defaultAudioState ?? AudioPreview.Unreviewed,
  );

  const [selectedTemplate, setSelectedTemplate] =
    useState<StaticTemplate | null>(null);

  const onClearAssociatedAlert = () => {
    setEndDateTime(moment(startDateTime).add(1, "hour"));
    setAssociatedAlert(null);
    setEndWithEffectPeriod(false);
  };

  const onImportMessage = (alertMessage: string) => {
    if (audioState !== AudioPreview.Unreviewed)
      setAudioState(AudioPreview.Outdated);
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

  useEffect(() => {
    const priorityToIntervalMap: { [priority: number]: string } = {
      1: "1",
      2: "4",
      3: "10",
      4: "12",
    };
    setInterval(priorityToIntervalMap[priority]);
  }, [priority]);

  return (
    <div className="new-pa-message">
      <MainForm
        hide={page !== Page.MAIN}
        onSubmit={() => {
          const formData: PaMessageFormData = {
            alert_id:
              typeof associatedAlert === "string"
                ? associatedAlert
                : associatedAlert?.id ?? null,
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
          onClearAssociatedAlert,
          setEndWithEffectPeriod,
          visualText,
          associatedAlert,
          endWithEffectPeriod,
          signIds,
          setSignIds,
          places,
          busRoutes,
          audioState,
          setAudioState,
          paused,
          selectedTemplate,
          setSelectedTemplate,
        }}
      />
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
          onApply={(
            alert,
            endWithEffectPeriod,
            importLocations,
            importMessage,
          ) => {
            setAssociatedAlert(alert);
            setEndWithEffectPeriod(endWithEffectPeriod);
            if (importLocations) {
              onImportLocations(alert.informed_entities);
            }
            if (importMessage) {
              onImportMessage(alert.header);
            }
            setPage(Page.MAIN);
          }}
          onCancel={() => setPage(Page.MAIN)}
        />
      )}
      {page === Page.TEMPLATES && (
        <StaticTemplatePage
          onCancel={() => setPage(Page.MAIN)}
          onSelect={(template) => {
            setSelectedTemplate(template);
            setVisualText(template.audio_text);
            setPhoneticText(template.audio_text);
            setPriority(template.type === "psa" ? 4 : 1);
            setAudioState(AudioPreview.Reviewed);
            setPage(Page.MAIN);
          }}
        />
      )}
      <Toast
        variant="warning"
        message={errorMessage}
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
