import React, { useEffect, useMemo, useState } from "react";
import { Page } from "./types";
import { Button, ButtonGroup } from "react-bootstrap";
import { Place } from "Models/place";
import { usePlacesWithSelectedScreens } from "./hooks";
import fp from "lodash/fp";
import { Screen } from "Models/screen";
import { BASE_PLACE_ROUTE_TO_ROUTE_IDS } from "Constants/constants";
import { busRouteIdsAtPlaces } from "../../../util";
import cx from "classnames";

const ROUTE_TO_CLASS_NAMES_MAP: { [key: string]: string } = {
  Green: "bg-green",
  Red: "bg-red",
  Orange: "bg-orange",
  Blue: "bg-blue",
  Mattapan: "bg-mattapan",
  Silver: "bg-silver",
  Bus: "bg-bus",
};

interface Props {
  zones: string[];
  setZones: (zones: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
}

const SelectZonesPage = ({ zones, setZones, navigateTo, places }: Props) => {
  const placesWithSelectedScreens = usePlacesWithSelectedScreens(places, zones);
  const PLACE_ROUTE_TO_ROUTE_IDS: { [key: string]: string[] } = {
    ...BASE_PLACE_ROUTE_TO_ROUTE_IDS,
    Bus: busRouteIdsAtPlaces(places),
  };

  const selectedRoutes = useMemo(() => {
    return fp.flow(
      fp.flatMap((place: Place) => place.screens),
      fp.flatMap((screen: Screen) => screen.route_ids),
      fp.uniq,
      fp.groupBy((routeID: string) => {
        if (routeID.startsWith("Green")) {
          return "Green";
        }

        if (PLACE_ROUTE_TO_ROUTE_IDS["Bus"].includes(routeID)) {
          return "Bus";
        }

        if (PLACE_ROUTE_TO_ROUTE_IDS["Silver"].includes(routeID)) {
          return "Silver";
        }

        return routeID;
      }),
    )(placesWithSelectedScreens);
  }, [placesWithSelectedScreens]);

  const [selectedRouteFilter, setSelectedRouteFilter] = useState("");

  useEffect(() => {
    setSelectedRouteFilter(Object.keys(selectedRoutes)[0]);
  }, [selectedRoutes]);

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
      <div className="zone-selection">
        <div className="filters-container">
          <div>Service type</div>
          <div className="filters">
            {Object.keys(selectedRoutes).map((routeID) => {
              return (
                <Button
                  key={routeID}
                  onClick={() => setSelectedRouteFilter(routeID)}
                  className={cx(
                    "filter-button",
                    ROUTE_TO_CLASS_NAMES_MAP[routeID],
                    {
                      selected: selectedRouteFilter === routeID,
                    },
                  )}
                >
                  {routeID}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="zones-table-container">
          <div className="container-header">
            <div className="title-and-route-container">
              <div className="title h3">Zones</div>
              <div
                className={`route ${ROUTE_TO_CLASS_NAMES_MAP[selectedRouteFilter]}`}
              >
                {selectedRouteFilter} line
              </div>
            </div>
            <div className="mass-select-button-container">
              <Button>All Zones (except bus)</Button>
              <Button>Direction 0</Button>
              <Button>Direction 1</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectZonesPage;
