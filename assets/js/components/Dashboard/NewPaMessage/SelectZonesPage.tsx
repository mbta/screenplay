import React from "react";
import { Page } from "./types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import { usePlacesWithSelectedScreens } from "./hooks";

interface Props {
  zones: string[];
  setZones: (zones: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
}

const SelectZonesPage = ({ zones, setZones, navigateTo, places }: Props) => {
  const placesWithSelectedScreens = usePlacesWithSelectedScreens(places, zones);

  return (
    <div className="select-zones-page">
      <div className="header">
        <div className="title-and-edit">
          <div className="title">Review Zones</div>
          <div>
            <Button
              className="edit-button"
              onClick={() => navigateTo(Page.STATIONS)}
            >
              Edit Stations
            </Button>
          </div>
        </div>
        <div className="buttons">
          <Button
            className="cancel-button"
            onClick={() => {
              setZones([]);
              navigateTo(Page.NEW);
            }}
          >
            Cancel
          </Button>
          <Button
            className="submit-button"
            onClick={() => navigateTo(Page.NEW)}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectZonesPage;
