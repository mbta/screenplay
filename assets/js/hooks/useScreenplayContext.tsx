import * as React from "react";
import { createGenericContext } from "../utils/createGenericContext";
import { Place } from "../models/place";
import { Alert } from "../models/alert";
import { ScreensByAlert } from "../models/screensByAlert";
import { useReducer } from "react";

interface Props {
  children: React.ReactNode;
}

type DirectionID = 0 | 1;

interface StateContextType {
  places: Place[];
  alerts: Alert[];
  screensByAlertMap: ScreensByAlert;
  placesPageDirectionId: DirectionID;
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
