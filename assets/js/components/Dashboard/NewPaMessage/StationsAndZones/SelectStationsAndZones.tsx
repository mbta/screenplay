import React, { useEffect, useState } from "react";
import SelectStationsPage from "./SelectStationsPage";
import SelectZonesPage from "./SelectZonesPage";
import type { Place } from "Models/place";
import { Page } from "../types";
import { useScreenplayDispatchContext } from "Hooks/useScreenplayContext";

interface Props {
  places: Place[];
  value: string[];
  onChange: (signIds: string[]) => void;
  navigateTo: (page: Page) => void;
  page: Page;
  busRoutes: string[];
  onError: (message: string) => void;
}

const SelectStationsAndZones = ({
  places,
  value,
  onChange,
  navigateTo,
  page,
  busRoutes,
  onError,
}: Props) => {
  const dispatch = useScreenplayDispatchContext();
  const [signIds, setSignIds] = useState(value);

  useEffect(() => {
    dispatch({ type: "SHOW_SIDEBAR", showSidebar: false });

    return () => dispatch({ type: "SHOW_SIDEBAR", showSidebar: true });
  }, [dispatch]);

  return page === Page.STATIONS ? (
    <SelectStationsPage
      places={places}
      navigateTo={navigateTo}
      value={signIds}
      onChange={setSignIds}
      busRoutes={busRoutes}
      onError={onError}
    />
  ) : (
    <SelectZonesPage
      navigateTo={navigateTo}
      value={signIds}
      onChange={setSignIds}
      places={places}
      onSubmit={onChange}
    />
  );
};

export default SelectStationsAndZones;
