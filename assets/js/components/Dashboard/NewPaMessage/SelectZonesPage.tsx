import React from "react";
import { Page } from "./types";

interface Props {
  navigateTo: (page: Page) => void;
}

const SelectZonesPage = ({ navigateTo }: Props) => {
  return <div>Select Zones Page</div>;
};

export default SelectZonesPage;
