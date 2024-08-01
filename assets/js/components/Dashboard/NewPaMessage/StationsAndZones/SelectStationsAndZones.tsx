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
}

const SelectStationsAndZones = ({
  places,
  value,
  onChange,
  navigateTo,
  page,
  busRoutes,
}: Props) => {
  const dispatch = useScreenplayDispatchContext();
  const [signIds, setSignIds] = useState(value);

  useEffect(() => {
    dispatch({ type: "SHOW_SIDEBAR", showSidebar: false });

    return () => dispatch({ type: "SHOW_SIDEBAR", showSidebar: true });
  }, []);

  return page === Page.STATIONS ? (
    <SelectStationsPage
      places={places}
      navigateTo={navigateTo}
      value={signIds}
      onChange={setSignIds}
      busRoutes={busRoutes}
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
