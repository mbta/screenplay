import React, {
  ComponentType,
  createContext,
  useEffect,
  useReducer,
} from "react";
import { Outlet } from "react-router";
import "../../../css/screenplay.scss";
import { Alert } from "../../models/alert";
import { Place } from "../../models/place";
import { ScreensByAlert } from "../../models/screensByAlert";
import Sidebar from "./Sidebar";

interface AlertsResponse {
  alerts: Alert[];
  screens_by_alert: ScreensByAlert;
}

const initialState = {
  places: [] as Place[],
  alerts: [] as Alert[],
  screensByAlertMap: {} as ScreensByAlert,
  placesPageDirectionId: 0,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_PLACES":
      return { ...state, places: action.places };
    case "SET_ALERTS":
      return { ...state, alerts: action.alerts };
    case "SET_SCREENS_BY_ALERT":
      return { ...state, screensByAlertMap: action.screensByAlertMap };
    default:
      throw new Error(`No case for type ${action.type} found in reducer.`);
  }
};

const Dashboard: ComponentType = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetch("/api/alerts")
      .then((response) => response.json())
      .then(({ alerts, screens_by_alert }: AlertsResponse) => {
        dispatch({ type: "SET_ALERTS", alerts });
        dispatch({
          type: "SET_SCREENS_BY_ALERT",
          screensByAlertMap: screens_by_alert,
        });
      });
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        dispatch({ type: "SET_PLACES", places: placeList });
      });
  }, []);

  return (
    <ScreenplayContext.Provider value={state}>
      <ScreenplayDispatchContext.Provider value={dispatch}>
        <div className="screenplay-container">
          <Sidebar />
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </ScreenplayDispatchContext.Provider>
    </ScreenplayContext.Provider>
  );
};

export const ScreenplayContext = createContext(initialState);
export const ScreenplayDispatchContext =
  createContext<React.Dispatch<any> | null>(null);

export default Dashboard;
