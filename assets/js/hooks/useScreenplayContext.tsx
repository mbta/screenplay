import * as React from "react";
import { createGenericContext } from "../utils/createGenericContext";
import { Place } from "../models/place";
import { Alert } from "../models/alert";
import { ScreensByAlert } from "../models/screensByAlert";
import { useReducer } from "react";
import {
  MODES_AND_LINES,
  SCREEN_TYPES,
  STATUSES,
} from "../constants/constants";
import { BannerAlert } from "../components/Dashboard/AlertBanner";

interface Props {
  children: React.ReactNode;
}

type ReducerAction =
  | {
      type: "SET_PLACES";
      places: Place[];
    }
  | {
      type: "SET_ALERTS";
      alerts: Alert[];
    }
  | {
      type: "SET_SCREENS_BY_ALERT";
      screensByAlertMap: ScreensByAlert;
    }
  | {
      type: "SET_BANNER_ALERT";
      bannerAlert: BannerAlert;
    };

type AlertsPageReducerAction =
  | { type: "SET_SORT_DIRECTION"; sortDirection: DirectionID }
  | {
      type:
        | "SET_MODE_LINE_FILTER"
        | "SET_SCREEN_TYPE_FILTER"
        | "SET_STATUS_FILTER";
      filterValue: FilterValue;
    };

type PlacesListReducerAction =
  | { type: "SET_SORT_DIRECTION"; sortDirection: DirectionID }
  | {
      type:
        | "SET_MODE_LINE_FILTER"
        | "SET_SCREEN_TYPE_FILTER"
        | "SET_STATUS_FILTER";
      filterValue: FilterValue;
    }
  | {
      type: "SET_SHOW_SCREENLESS_PLACES";
      show: boolean;
    }
  | { type: "SET_ACTIVE_EVENT_KEYS"; eventKeys: string[] }
  | { type: "RESET_STATE" };

type DirectionID = 0 | 1;

interface FilterValue {
  label: string;
  ids: string[];
  color?: string;
}

interface PlacesListState {
  sortDirection: DirectionID;
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
  showScreenlessPlaces: boolean;
  activeEventKeys: string[];
}

interface AlertsPageState {
  sortDirection: DirectionID;
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
}

interface ScreenplayState {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
  bannerAlert?: BannerAlert;
}

const reducer = (state: ScreenplayState, action: ReducerAction) => {
  switch (action.type) {
    case "SET_PLACES":
      return { ...state, places: action.places };
    case "SET_ALERTS":
      return { ...state, alerts: action.alerts };
    case "SET_SCREENS_BY_ALERT":
      return { ...state, screensByAlertMap: action.screensByAlertMap };
    case "SET_BANNER_ALERT":
      return {
        ...state,
        bannerAlert: action.bannerAlert,
      };
  }
};

const placesListReducer = (
  state: PlacesListState,
  action: PlacesListReducerAction
) => {
  switch (action.type) {
    case "SET_SORT_DIRECTION":
      return {
        ...state,
        sortDirection: action.sortDirection as DirectionID,
      };
    case "SET_MODE_LINE_FILTER":
      return {
        ...state,
        modeLineFilterValue: action.filterValue,
        activeEventKeys: [],
      };
    case "SET_SCREEN_TYPE_FILTER":
      return {
        ...state,
        screenTypeFilterValue: action.filterValue,
        activeEventKeys: [],
      };
    case "SET_STATUS_FILTER":
      return {
        ...state,
        statusFilterValue: action.filterValue,
        activeEventKeys: [],
      };
    case "SET_SHOW_SCREENLESS_PLACES":
      return {
        ...state,
        showScreenlessPlaces: action.show,
        activeEventKeys: [],
      };
    case "SET_ACTIVE_EVENT_KEYS":
      return {
        ...state,
        activeEventKeys: action.eventKeys,
      };
    case "RESET_STATE":
      return initialPlacesListState;
  }
};

const alertsReducer = (
  state: AlertsPageState,
  action: AlertsPageReducerAction
) => {
  switch (action.type) {
    case "SET_SORT_DIRECTION":
      return {
        ...state,
        sortDirection: action.sortDirection as DirectionID,
      };
    case "SET_MODE_LINE_FILTER":
      return {
        ...state,
        modeLineFilterValue: action.filterValue,
      };
    case "SET_SCREEN_TYPE_FILTER":
      return {
        ...state,
        screenTypeFilterValue: action.filterValue,
      };
    case "SET_STATUS_FILTER":
      return {
        ...state,
        statusFilterValue: action.filterValue,
      };
  }
};

const initialState: ScreenplayState = {
  places: [] as Place[],
  alerts: [] as Alert[],
  screensByAlertMap: {} as ScreensByAlert,
  bannerAlert: undefined,
};

const initialPlacesListState: PlacesListState = {
  sortDirection: 0 as DirectionID,
  modeLineFilterValue: MODES_AND_LINES[0],
  screenTypeFilterValue: SCREEN_TYPES[0],
  statusFilterValue: STATUSES[0],
  showScreenlessPlaces: true,
  activeEventKeys: [],
};

const initialAlertsPageState: AlertsPageState = {
  sortDirection: 0 as DirectionID,
  modeLineFilterValue: MODES_AND_LINES[0],
  screenTypeFilterValue: SCREEN_TYPES[0],
  statusFilterValue: STATUSES[0],
};

// Generate context
const [useScreenplayContext, ScreenplayContextProvider] =
  createGenericContext<ScreenplayState>();

const [useScreenplayDispatchContext, ScreenplayDispatchContextProvider] =
  createGenericContext<React.Dispatch<any>>();

const [usePlacesListContext, PlacesListContextProvider] =
  createGenericContext<PlacesListState>();

const [usePlacesListDispatchContext, PlacesListDispatchContextProvider] =
  createGenericContext<React.Dispatch<any>>();

const [useAlertsPageContext, AlertsPageContextProvider] =
  createGenericContext<AlertsPageState>();

const [useAlertsPageDispatchContext, AlertsPageDispatchContextProvider] =
  createGenericContext<React.Dispatch<any>>();

// Generate provider
const ScreenplayProvider = ({ children }: Props) => {
  const [screenplayState, screenplayDispatch] = useReducer(
    reducer,
    initialState
  );
  const [placesListState, placesListDispatch] = useReducer(
    placesListReducer,
    initialPlacesListState
  );
  const [alertsPageState, alertsPageDispatch] = useReducer(
    alertsReducer,
    initialAlertsPageState
  );

  return (
    <ScreenplayContextProvider value={screenplayState}>
      <ScreenplayDispatchContextProvider value={screenplayDispatch}>
        <PlacesListContextProvider value={placesListState}>
          <PlacesListDispatchContextProvider value={placesListDispatch}>
            <AlertsPageContextProvider value={alertsPageState}>
              <AlertsPageDispatchContextProvider value={alertsPageDispatch}>
                {children}
              </AlertsPageDispatchContextProvider>
            </AlertsPageContextProvider>
          </PlacesListDispatchContextProvider>
        </PlacesListContextProvider>
      </ScreenplayDispatchContextProvider>
    </ScreenplayContextProvider>
  );
};

export {
  useScreenplayContext,
  useScreenplayDispatchContext,
  usePlacesListContext,
  usePlacesListDispatchContext,
  useAlertsPageContext,
  useAlertsPageDispatchContext,
  ScreenplayProvider,
  FilterValue,
  DirectionID,
};
