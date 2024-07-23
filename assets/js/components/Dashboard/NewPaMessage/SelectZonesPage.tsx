import React, { useEffect, useMemo, useState } from "react";
import { Page } from "./types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import { usePlacesWithSelectedScreens } from "./hooks";
import fp from "lodash/fp";
import { Screen } from "Models/screen";
import { BASE_PLACE_ROUTE_TO_ROUTE_IDS } from "Constants/constants";
import { busRouteIdsAtPlaces, sortByStationOrder } from "../../../util";
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
  signs: string[];
  setSigns: (signs: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
}

const SelectZonesPage = ({ signs, setSigns, navigateTo, places }: Props) => {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("");
  const placesWithSelectedScreens = usePlacesWithSelectedScreens(places, signs);
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

  useEffect(() => {
    setSelectedRouteFilter(Object.keys(selectedRoutes)[0]);
  }, [selectedRoutes]);

  // TODO: initialize this in a more stable way
  if (!selectedRouteFilter) return null;

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
              setSigns([]);
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
          <table className="zones-table">
            <thead>
              <tr className="table-header">
                <th></th>
                <th>All</th>
                <th>Direction 0</th>
                <th>Middle</th>
                <th>Direction 1</th>
              </tr>
            </thead>
            <tbody>
              {sortByStationOrder(
                placesWithSelectedScreens,
                selectedRouteFilter,
              ).map((place) => (
                <PlaceZonesRow
                  key={place.id}
                  place={places.find((p) => p.id === place.id)}
                  allSelectedSigns={signs}
                  setSigns={setSigns}
                  route={selectedRouteFilter}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PlaceZonesRow = ({
  place,
  allSelectedSigns,
  setSigns,
  route,
}: {
  place: Place | undefined;
  allSelectedSigns: string[];
  setSigns: (signs: string[]) => void;
  route: string;
}) => {
  if (!place) return null;

  const allSignsForRouteAtPlace =
    place.screens.filter((screen) => screen.route_ids?.includes(route)) ?? [];

  const selectedSignsAtPlace = fp.intersection(
    allSignsForRouteAtPlace.map((s) => s.id),
    allSelectedSigns,
  );

  const signsInZones = (zones: string[]) => {
    return allSignsForRouteAtPlace.filter((sign) =>
      fp.includes(sign.zone, zones),
    );
  };

  const onSignButtonClick = (signID: string) => {
    if (allSelectedSigns.includes(signID)) {
      setSigns(fp.without([signID], allSelectedSigns));
    } else {
      setSigns(fp.uniq([...allSelectedSigns, signID]));
    }
  };

  const allSignsSelected =
    selectedSignsAtPlace.length === allSignsForRouteAtPlace.length;

  return (
    <tr className="table-row">
      <td className="place-name">{place.name}</td>
      <td>
        <Button className={cx({ selected: allSignsSelected })}>All</Button>
      </td>
      <td>
        {signsInZones(["s", "w"]).map((sign) => {
          return (
            <SignButton
              key={sign.id}
              onClick={() => {
                onSignButtonClick(sign.id);
              }}
              isSelected={allSelectedSigns.includes(sign.id)}
              label="Direction 0"
            />
          );
        })}
      </td>
      <td>
        {signsInZones(["c", "m"]).map((sign) => {
          return (
            <SignButton
              key={sign.id}
              onClick={() => {
                onSignButtonClick(sign.id);
              }}
              isSelected={allSelectedSigns.includes(sign.id)}
              label="Middle"
            />
          );
        })}
      </td>
      <td>
        {signsInZones(["n", "e"]).map((sign) => {
          return (
            <SignButton
              key={sign.id}
              onClick={() => {
                onSignButtonClick(sign.id);
              }}
              isSelected={allSelectedSigns.includes(sign.id)}
              label="Direction 1"
            />
          );
        })}
      </td>
    </tr>
  );
};

interface SignButtonProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

const SignButton = ({ isSelected, onClick, label }: SignButtonProps) => {
  return (
    <Button
      className={cx({
        selected: isSelected,
      })}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export default SelectZonesPage;
