import React, { useState } from "react";
import { createGenericContext } from "../utils/createGenericContext";
import { Place } from "../models/place";
import { Alert } from "../models/alert";
import { DirectionID } from "../models/direction_id";
import { ScreensByAlert } from "../models/screensByAlert";
import { LineStop } from "../models/line_stop";
import { SuppressedPrediction } from "../models/suppressed_prediction";
import { ConfigValidationErrors } from "../models/configValidationErrors";
import {
  PLACES_PAGE_MODES_AND_LINES,
  ALERTS_PAGE_MODES_AND_LINES,
  SCREEN_TYPES,
  STATUSES,
} from "Constants/constants";
import { BannerAlert } from "../components/Dashboard/AlertBanner";
import { ActionOutcomeToastProps } from "../components/Dashboard/ActionOutcomeToast";
import useSWR, { KeyedMutator } from "swr";
import { getSuppressedPredictions } from "Utils/api";

interface Props {
  children: React.ReactNode;
}

interface FilterValue {
  label: string;
  ids: string[];
  color?: string;
}

interface ScreenplayState {
  places: Place[];
  lineStops: LineStop[];
  alerts: Alert[];
  allAPIAlertIds: string[];
  screensByAlertMap: ScreensByAlert;
  bannerAlert?: BannerAlert;
  showLinkCopied: boolean;
  actionOutcomeToast: ActionOutcomeToastProps;
  showSidebar: boolean;
  setPlaces: (value: Place[]) => void;
  setLineStops: (value: LineStop[]) => void;
  setAlerts: (
    alerts: Alert[],
    allAPIAlertIds: string[],
    screensByAlertMap: ScreensByAlert,
  ) => void;
  setBannerAlert: (value?: BannerAlert) => void;
  setShowLinkCopied: (value: boolean) => void;
  showActionOutcome: (isSuccessful: boolean, message: string) => void;
  hideActionOutcome: () => void;
  setShowSidebar: (value: boolean) => void;
}

const [useScreenplayState, ScreenplayStateProvider] =
  createGenericContext<ScreenplayState>();

const ScreenplayStateContainer = ({ children }: Props) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [lineStops, setLineStops] = useState<LineStop[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [allAPIAlertIds, setAllAPIAlertIds] = useState<string[]>([]);
  const [screensByAlertMap, setScreensByAlertMap] = useState<ScreensByAlert>(
    {},
  );
  const [bannerAlert, setBannerAlert] = useState<BannerAlert>();
  const [showLinkCopied, setShowLinkCopied] = useState<boolean>(false);
  const [actionOutcomeToast, setActionOutcomeToast] =
    useState<ActionOutcomeToastProps>({ show: false });
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  return (
    <ScreenplayStateProvider
      value={{
        places,
        lineStops,
        alerts,
        allAPIAlertIds,
        screensByAlertMap,
        bannerAlert,
        showLinkCopied,
        actionOutcomeToast,
        showSidebar,
        setPlaces,
        setLineStops,
        setAlerts: (alerts, allAPIAlertIds, screensByAlertMap) => {
          setAlerts(alerts);
          setAllAPIAlertIds(allAPIAlertIds);
          setScreensByAlertMap(screensByAlertMap);
        },
        setBannerAlert,
        setShowLinkCopied,
        showActionOutcome: (isSuccessful, message) => {
          setActionOutcomeToast({ show: true, isSuccessful, message });
        },
        hideActionOutcome: () => setActionOutcomeToast({ show: false }),
        setShowSidebar,
      }}
    >
      {children}
    </ScreenplayStateProvider>
  );
};

interface AlertsListState {
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
  setModeLineFilterValue: (arg0: FilterValue) => void;
  setScreenTypeFilterValue: (arg0: FilterValue) => void;
  setStatusFilterValue: (arg0: FilterValue) => void;
}

const [useAlertsListState, AlertsListStateProvider] =
  createGenericContext<AlertsListState>();

const AlertsListStateContainer = ({ children }: Props) => {
  const [modeLineFilterValue, setModeLineFilterValue] = useState<FilterValue>(
    ALERTS_PAGE_MODES_AND_LINES[0],
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] =
    useState<FilterValue>(SCREEN_TYPES[0]);
  const [statusFilterValue, setStatusFilterValue] = useState<FilterValue>(
    STATUSES[0],
  );
  return (
    <AlertsListStateProvider
      value={{
        modeLineFilterValue,
        screenTypeFilterValue,
        statusFilterValue,
        setModeLineFilterValue,
        setScreenTypeFilterValue,
        setStatusFilterValue,
      }}
    >
      {children}
    </AlertsListStateProvider>
  );
};

interface ConfigValidationState {
  newScreenValidationErrors: ConfigValidationErrors;
  pendingScreenValidationErrors: ConfigValidationErrors;
  setValidationErrors: (
    arg0: ConfigValidationErrors,
    arg1: ConfigValidationErrors,
  ) => void;
}

const [useConfigValidationState, ConfigValidationStateProvider] =
  createGenericContext<ConfigValidationState>();

const ConfigValidationStateContainer = ({ children }: Props) => {
  const [newScreenValidationErrors, setNewScreenValidationErrors] =
    useState<ConfigValidationErrors>({});
  const [pendingScreenValidationErrors, setPendingScreenValidationErrors] =
    useState<ConfigValidationErrors>({});

  return (
    <ConfigValidationStateProvider
      value={{
        newScreenValidationErrors,
        pendingScreenValidationErrors,
        setValidationErrors: (newErrors, pendingErrors) => {
          setNewScreenValidationErrors(newErrors);
          setPendingScreenValidationErrors(pendingErrors);
        },
      }}
    >
      {children}
    </ConfigValidationStateProvider>
  );
};

interface PlacesListState {
  sortDirection: DirectionID;
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
  showScreenlessPlaces: boolean;
  activeEventKeys: string[];
  setSortDirection: (value: DirectionID) => void;
  setModeLineFilterValue: (value: FilterValue) => void;
  setScreenTypeFilterValue: (value: FilterValue) => void;
  setStatusFilterValue: (value: FilterValue) => void;
  setShowScreenlessPlaces: (value: boolean) => void;
  setActiveEventKeys: (value: string[]) => void;
  resetState: () => void;
}

const [usePlacesListState, PlacesListStateProvider] =
  createGenericContext<PlacesListState>();

const PlacesListStateContainer = ({ children }: Props) => {
  const [sortDirection, setSortDirection] = useState<DirectionID>(0);
  const [modeLineFilterValue, setModeLineFilterValue] = useState<FilterValue>(
    PLACES_PAGE_MODES_AND_LINES[0],
  );
  const [screenTypeFilterValue, setScreenTypeFilterValue] =
    useState<FilterValue>(SCREEN_TYPES[0]);
  const [statusFilterValue, setStatusFilterValue] = useState<FilterValue>(
    STATUSES[0],
  );
  const [showScreenlessPlaces, setShowScreenlessPlaces] =
    useState<boolean>(true);
  const [activeEventKeys, setActiveEventKeys] = useState<string[]>([]);

  return (
    <PlacesListStateProvider
      value={{
        sortDirection,
        modeLineFilterValue,
        screenTypeFilterValue,
        statusFilterValue,
        showScreenlessPlaces,
        activeEventKeys,
        setSortDirection,
        setModeLineFilterValue: (value) => {
          setModeLineFilterValue(value);
          setSortDirection(0);
          setActiveEventKeys([]);
        },
        setScreenTypeFilterValue: (value) => {
          setScreenTypeFilterValue(value);
          setActiveEventKeys([]);
        },
        setStatusFilterValue: (value) => {
          setStatusFilterValue(value);
          setActiveEventKeys([]);
        },
        setShowScreenlessPlaces: (value) => {
          setShowScreenlessPlaces(value);
          setActiveEventKeys([]);
        },
        setActiveEventKeys,
        resetState: () => {
          setSortDirection(0);
          setModeLineFilterValue(PLACES_PAGE_MODES_AND_LINES[0]);
          setScreenTypeFilterValue(SCREEN_TYPES[0]);
          setStatusFilterValue(STATUSES[0]);
          setShowScreenlessPlaces(true);
          setActiveEventKeys([]);
        },
      }}
    >
      {children}
    </PlacesListStateProvider>
  );
};

interface PredictionSuppressionState {
  suppressedPredictions?: SuppressedPrediction[];
  mutateSuppressedPredictions: KeyedMutator<SuppressedPrediction[]>;
}

const [usePredictionSuppressionState, PredictionSuppressionStateProvider] =
  createGenericContext<PredictionSuppressionState>();

const PredictionSuppressionStateContainer = ({ children }: Props) => {
  const { data, mutate } = useSWR<SuppressedPrediction[]>(
    "/api/suppressed-predictions",
    getSuppressedPredictions,
    { refreshInterval: 4000 },
  );
  return (
    <PredictionSuppressionStateProvider
      value={{
        suppressedPredictions: data,
        mutateSuppressedPredictions: mutate,
      }}
    >
      {children}
    </PredictionSuppressionStateProvider>
  );
};

// Generate provider
const ScreenplayProvider = ({ children }: Props) => {
  return (
    <ScreenplayStateContainer>
      <PlacesListStateContainer>
        <AlertsListStateContainer>
          <ConfigValidationStateContainer>
            <PredictionSuppressionStateContainer>
              {children}
            </PredictionSuppressionStateContainer>
          </ConfigValidationStateContainer>
        </AlertsListStateContainer>
      </PlacesListStateContainer>
    </ScreenplayStateContainer>
  );
};

// Types & Interfaces
export { FilterValue, DirectionID };

// Values
export {
  useScreenplayState,
  usePlacesListState,
  useConfigValidationState,
  useAlertsListState,
  usePredictionSuppressionState,
  ScreenplayProvider,
  PlacesListStateContainer,
};
