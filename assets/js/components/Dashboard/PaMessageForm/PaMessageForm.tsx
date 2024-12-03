import React, { useEffect, useState } from "react";
import moment from "moment";
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
import { MessageType } from "Models/pa_message";

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
  message_type: MessageType;
  template_id: number | null;
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
  defaultTemplate?: StaticTemplate | null;
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
  defaultTemplate,
  defaultAudioState,
  paused,
}: Props) => {
  const [page, setPage] = useState<Page>(Page.MAIN);
  const now = moment();
  const defaultPriority = 2;

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

  const [startDate, setStartDate] = useState(() => {
    if (defaultValues?.start_datetime)
      return moment(defaultValues.start_datetime).format("YYYY-MM-DD");
    return now.format("YYYY-MM-DD");
  });

  const [startTime, setStartTime] = useState(() => {
    if (defaultValues?.start_datetime)
      return moment(defaultValues.start_datetime).format("HH:mm");
    return now.format("HH:mm");
  });

  const [endDate, setEndDate] = useState(() => {
    if (defaultValues?.end_datetime)
      return moment(defaultValues.end_datetime).format("YYYY-MM-DD");
    return now.format("YYYY-MM-DD");
  });

  const [endTime, setEndTime] = useState(() => {
    if (defaultValues?.end_datetime)
      return moment(defaultValues.end_datetime).format("HH:mm");
    return now.add(1, "hour").format("HH:mm");
  });

  const [days, setDays] = useState(() => {
    return defaultValues?.days_of_week ?? [1, 2, 3, 4, 5, 6, 7];
  });
  const [priority, setPriority] = useState(() => {
    return defaultValues?.priority ?? defaultPriority;
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
    useState<StaticTemplate | null>(defaultTemplate ?? null);

  const onClearAssociatedAlert = () => {
    setEndDate(startDate);
    setEndTime(moment(startTime, "HH:mm").add(1, "hour").format("HH:mm"));
    setAssociatedAlert(null);
    setEndWithEffectPeriod(false);
  };

  const onClearSelectedTemplate = () => {
    setSelectedTemplate(null);
    setVisualText("");
    setPhoneticText("");
    setAudioState(AudioPreview.Unreviewed);
    setPriority(defaultPriority);
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

  const startDateTime = moment(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm");
  const endDateTime = moment(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm");

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
            message_type: selectedTemplate?.type ?? null,
            template_id: selectedTemplate?.id ?? null,
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
          startDate,
          setStartDate,
          startTime,
          setStartTime,
          endDate,
          setEndDate,
          endTime,
          setEndTime,
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
          onClearSelectedTemplate,
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
            setVisualText(template.visual_text);
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
