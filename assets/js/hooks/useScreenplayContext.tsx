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

interface Props {
  children: React.ReactNode;
}

type DirectionID = 0 | 1;

interface FilterValue {
  label: string;
  ids: string[];
  color?: string;
}

interface PageProps {
  sortDirection: DirectionID;
  modeLineFilterValue: FilterValue;
  screenTypeFilterValue: FilterValue;
  statusFilterValue: FilterValue;
}

interface StateContextType {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
  placesPageDirectionId: DirectionID;
  alertsPage: PageProps;
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_PLACES":
      return { ...state, places: action.places };
    case "SET_ALERTS":
      return { ...state, alerts: action.alerts };
    case "SET_SCREENS_BY_ALERT":
      return { ...state, screensByAlertMap: action.screensByAlertMap };
    case "SET_SORT_DIRECTION":
      if (action.page === "PLACES") {
        return {
          ...state,
          placesPageDirectionId: action.sortDirection as DirectionID,
        };
      } else if (action.page === "ALERTS") {
        return {
          ...state,
          alertsPage: {
            ...state.alertsPage,
            sortDirection: action.sortDirection as DirectionID,
          },
        };
      }

      return state;
    case "SET_MODE_LINE_FILTER":
      if (action.page === "ALERTS") {
        return {
          ...state,
          alertsPage: {
            ...state.alertsPage,
            modeLineFilterValue: action.filterValue,
          },
        };
      }

      return state;
    case "SET_SCREEN_TYPE_FILTER":
      if (action.page === "ALERTS") {
        return {
          ...state,
          alertsPage: {
            ...state.alertsPage,
            screenTypeFilterValue: action.filterValue,
          },
        };
      }

      return state;
    case "SET_STATUS_FILTER":
      if (action.page === "ALERTS") {
        return {
          ...state,
          alertsPage: {
            ...state.alertsPage,
            statusFilterValue: action.filterValue,
          },
        };
      }

      return state;
    default:
      throw new Error(`No case for type ${action.type} found in reducer.`);
  }
};

const initialState = {
  places: [] as Place[],
  alerts: [] as Alert[],
  screensByAlertMap: {} as ScreensByAlert,
  placesPageDirectionId: 0 as DirectionID,
  alertsPage: {
    sortDirection: 0 as DirectionID,
    modeLineFilterValue: MODES_AND_LINES[0],
    screenTypeFilterValue: SCREEN_TYPES[0],
    statusFilterValue: STATUSES[0],
  },
};

// Generate context
const [useScreenplayContext, ScreenplayContextProvider] =
  createGenericContext<StateContextType>();

const [useScreenplayDispatchContext, ScreenplayDispatchContextProvider] =
  createGenericContext<React.Dispatch<any>>();

// Generate provider
const ScreenplayProvider = ({ children }: Props) => {
  //   const state = useScreenplayContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ScreenplayContextProvider value={state}>
      <ScreenplayDispatchContextProvider value={dispatch}>
        {children}
      </ScreenplayDispatchContextProvider>
    </ScreenplayContextProvider>
  );
};

export {
  useScreenplayContext,
  useScreenplayDispatchContext,
  ScreenplayProvider,
};
