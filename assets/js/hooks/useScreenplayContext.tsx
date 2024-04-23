import * as React from "react";
import { createGenericContext } from "../utils/createGenericContext";
import { Place } from "../models/place";
import { Alert } from "../models/alert";
import { DirectionID } from "../models/direction_id";
import { ScreensByAlert } from "../models/screensByAlert";
import { useReducer } from "react";
import {
  PLACES_PAGE_MODES_AND_LINES,
  ALERTS_PAGE_MODES_AND_LINES,
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
      allAPIAlertIds: string[];
      screensByAlertMap: ScreensByAlert;
    }
  | {
      type: "SET_SCREENS_BY_ALERT";
      screensByAlertMap: ScreensByAlert;
    }
  | {
      type: "SET_BANNER_ALERT";
      bannerAlert: BannerAlert | undefined;
    }
  | {
      type: "SHOW_LINK_COPIED";
      showLinkCopied: boolean;
    };

type AlertsListReducerAction = {
  type: "SET_MODE_LINE_FILTER" | "SET_SCREEN_TYPE_FILTER" | "SET_STATUS_FILTER";
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

interface AlertsListState {
  sortDirection: DirectionID;
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
}

interface ScreenplayState {
  places: Place[];
  alerts: Alert[];
  allAPIAlertIds: string[];
  screensByAlertMap: ScreensByAlert;
  bannerAlert?: BannerAlert;
  showLinkCopied: boolean;
}

const reducer = (state: ScreenplayState, action: ReducerAction) => {
  switch (action.type) {
    case "SET_PLACES":
      return { ...state, places: action.places };
    case "SET_ALERTS":
      return {
        ...state,
        alerts: action.alerts,
        allAPIAlertIds: action.allAPIAlertIds,
        screensByAlertMap: action.screensByAlertMap,
      };
    case "SET_BANNER_ALERT":
      return {
        ...state,
        bannerAlert: action.bannerAlert,
      };
    case "SHOW_LINK_COPIED":
      return {
        ...state,
        showLinkCopied: action.showLinkCopied,
      };
    default:
      throw new Error();
  }
};

const placesListReducer = (
  state: PlacesListState,
  action: PlacesListReducerAction,
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
  state: AlertsListState,
  action: AlertsListReducerAction,
) => {
  switch (action.type) {
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
  allAPIAlertIds: [] as string[],
  screensByAlertMap: {} as ScreensByAlert,
  bannerAlert: undefined,
  showLinkCopied: false,
};

const initialPlacesListState: PlacesListState = {
  sortDirection: 0 as DirectionID,
  modeLineFilterValue: PLACES_PAGE_MODES_AND_LINES[0],
  screenTypeFilterValue: SCREEN_TYPES[0],
  statusFilterValue: STATUSES[0],
  showScreenlessPlaces: true,
  activeEventKeys: [],
};

const initialAlertsListState: AlertsListState = {
  sortDirection: 0 as DirectionID,
  modeLineFilterValue: ALERTS_PAGE_MODES_AND_LINES[0],
  screenTypeFilterValue: SCREEN_TYPES[0],
  statusFilterValue: STATUSES[0],
};

// Generate context
const [useScreenplayContext, ScreenplayContextProvider] =
  createGenericContext<ScreenplayState>();

const [useScreenplayDispatchContext, ScreenplayDispatchContextProvider] =
  createGenericContext<React.Dispatch<ReducerAction>>();

const [usePlacesListContext, PlacesListContextProvider] =
  createGenericContext<PlacesListState>();

const [usePlacesListDispatchContext, PlacesListDispatchContextProvider] =
  createGenericContext<React.Dispatch<PlacesListReducerAction>>();

const [useAlertsListContext, AlertsListContextProvider] =
  createGenericContext<AlertsListState>();

const [useAlertsListDispatchContext, AlertsListDispatchContextProvider] =
  createGenericContext<React.Dispatch<AlertsListReducerAction>>();

// Generate provider
const ScreenplayProvider = ({ children }: Props) => {
  const [screenplayState, screenplayDispatch] = useReducer(
    reducer,
    initialState,
  );
  const [placesListState, placesListDispatch] = useReducer(
    placesListReducer,
    initialPlacesListState,
  );
  const [alertsListState, alertsListDispatch] = useReducer(
    alertsReducer,
    initialAlertsListState,
  );

  return (
    <ScreenplayContextProvider value={screenplayState}>
      <ScreenplayDispatchContextProvider value={screenplayDispatch}>
        <PlacesListContextProvider value={placesListState}>
          <PlacesListDispatchContextProvider value={placesListDispatch}>
            <AlertsListContextProvider value={alertsListState}>
              <AlertsListDispatchContextProvider value={alertsListDispatch}>
                {children}
              </AlertsListDispatchContextProvider>
            </AlertsListContextProvider>
          </PlacesListDispatchContextProvider>
        </PlacesListContextProvider>
      </ScreenplayDispatchContextProvider>
    </ScreenplayContextProvider>
  );
};

// Types & Interfaces
export { FilterValue, DirectionID, PlacesListReducerAction, PlacesListState };

// Values
export {
  useScreenplayContext,
  useScreenplayDispatchContext,
  usePlacesListContext,
  usePlacesListDispatchContext,
  useAlertsListContext,
  useAlertsListDispatchContext,
  ScreenplayProvider,
  placesListReducer,
  initialPlacesListState,
};
