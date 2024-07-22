import React from "react";
import { Page } from "./types";

interface Props {
  zones: string[];
  setZones: (zones: string[]) => void;
  navigateTo: (page: Page) => void;
}

const SelectZonesPage = ({ navigateTo }: Props) => {
  return <div>Select Zones Page</div>;
};

export default SelectZonesPage;
