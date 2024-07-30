import React, { useState } from "react";
import SelectStationsPage from "./SelectStationsPage";
import SelectZonesPage from "./SelectZonesPage";
import type { Place } from "Models/place";
import { Page } from "../types";

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
  const [signIds, setSignIds] = useState(value);

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
