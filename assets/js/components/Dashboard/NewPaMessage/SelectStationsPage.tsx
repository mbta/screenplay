import React from "react";
import { Button, Container, Form } from "react-bootstrap";
import fp from "lodash/fp";
import type { Place } from "Models/place";
import RouteColumn from "./RouteColumn";
import { GREEN_LINE_ROUTES, SILVER_LINE_ROUTES } from "Constants/constants";
import StationGroupCheckbox from "./StationGroupCheckbox";
import SelectedStationsSummary from "./SelectedStationsSummary";
import {
  GL_CENTRAL_SUBWAY,
  GL_D_BRANCH,
  GL_E_BRANCH,
  GLX,
  ORANGE_NORTH,
  ORANGE_SOUTH,
  RED_ASHMONT_BRANCH,
  RED_BRAINTREE_BRANCH,
  RED_TRUNK,
} from "./StationGroups";
import { Page } from "./types";

const BASE_PLACE_ROUTE_TO_ROUTE_IDS: { [key: string]: string[] } = {
  "Green-B": ["Green-B"],
  "Green-C": ["Green-C"],
  "Green-D": ["Green-D"],
  "Green-E": ["Green-E"],
  Red: ["Red"],
  Orange: ["Orange"],
  Blue: ["Blue"],
  Mattapan: ["Mattapan"],
  Silver: SILVER_LINE_ROUTES,
};

const ROUTE_TO_CLASS_NAMES_MAP: { [key: string]: string } = {
  Red: "route-col--red",
  Orange: "route-col--orange",
  Blue: "route-col--blue",
  Mattapan: "route-col--mattapan",
  Silver: "route-col--silver",
};

interface Props {
  places: Place[];
  zones: string[];
  setZones: (zone: string[]) => void;
  navigateTo: (page: Page) => void;
}

const SelectStationsPage = ({ places, zones, setZones, navigateTo }: Props) => {
  if (places.length === 0) return null;

  const allRoutes = fp.uniq(
    places.flatMap((place) =>
      place.screens.flatMap((screen) => screen.route_ids ?? []),
    ),
  );

  const busRoutes = fp.without(
    Object.values(BASE_PLACE_ROUTE_TO_ROUTE_IDS).flat(),
    allRoutes,
  );

  const routeNameToRouteIds: { [key: string]: string[] } = {
    ...BASE_PLACE_ROUTE_TO_ROUTE_IDS,
    Bus: busRoutes,
  };

  const placesByRoute = places.reduce<{ [key: string]: Array<Place> }>(
    (acc, place) => {
      place.routes.forEach((route) => {
        const groupedRoutes = routeNameToRouteIds[route];
        if (
          place.screens.some(
            (screen) =>
              fp.intersection(groupedRoutes, screen.route_ids).length > 0,
          )
        ) {
          acc[route] = [...(acc[route] || []), place];
        }
      });
      return acc;
    },
    {},
  );

  const greenLineSignIds = fp.uniq(
    GREEN_LINE_ROUTES.flatMap((route) => placesByRoute[route]).flatMap(
      (place) =>
        place.screens
          .filter(
            (screen) =>
              fp.intersection(GREEN_LINE_ROUTES, screen.route_ids).length > 0,
          )
          .map((screen) => screen.id),
    ),
  );

  return (
    <div className="select-stations-page">
      <div className="header">
        <div>Select Stations</div>
        <div className="buttons">
          <Button
            className="cancel-button"
            onClick={() => navigateTo(Page.NEW)}
          >
            Cancel
          </Button>
          <Button
            className="submit-button"
            onClick={() => navigateTo(Page.ZONES)}
          >
            Review Zones
          </Button>
        </div>
      </div>
      <SelectedStationsSummary
        places={places}
        value={zones}
        onChange={setZones}
        busRoutes={busRoutes}
      />
      <Container fluid>
        <div className="station-groups-col col">
          <div className="title">Station Groups</div>
          <div className="col-content">
            <div className="route-groups ">
              <div className="h5">Green line</div>
              <StationGroupCheckbox
                title="Central Subway"
                label="North Station-Kenmore"
                places={places}
                routes={GREEN_LINE_ROUTES}
                stations={GL_CENTRAL_SUBWAY}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="GL D Branch"
                label="Kenmore-Riverside"
                places={places}
                routes={["Green-D"]}
                stations={GL_D_BRANCH}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="GL E Branch"
                label="Prudential-Symphony"
                places={places}
                routes={["Green-E"]}
                stations={GL_E_BRANCH}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="GLX"
                label="Medford/Tufts-North Station"
                places={places}
                routes={["Green-D", "Green-E"]}
                stations={GLX}
                value={zones}
                onChange={setZones}
              />
              <hr />
            </div>
            <div className="route-groups">
              <div className="h5">Red line</div>
              <StationGroupCheckbox
                title="Braintree Branch"
                label="JFK-Braintree"
                places={places}
                routes={["Red"]}
                stations={RED_BRAINTREE_BRANCH}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="Ashmont Branch"
                label="JFK-Ashmont"
                places={places}
                routes={["Red"]}
                stations={RED_ASHMONT_BRANCH}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="Red Line Trunk"
                label="Alewife-JFK"
                places={places}
                routes={["Red"]}
                stations={RED_TRUNK}
                value={zones}
                onChange={setZones}
              />
              <hr />
            </div>
            <div className="route-groups">
              <div className="h5">Orange line</div>
              <StationGroupCheckbox
                title="North"
                label="Oak Grove-North Station"
                places={places}
                routes={["Orange"]}
                stations={ORANGE_NORTH}
                value={zones}
                onChange={setZones}
              />
              <StationGroupCheckbox
                title="South"
                label="Haymarket-Forest Hills"
                places={places}
                routes={["Orange"]}
                stations={ORANGE_SOUTH}
                value={zones}
                onChange={setZones}
              />
            </div>
          </div>
        </div>
        <div className="route-col route-col--green col">
          <Form.Check
            className="title"
            label="Green line"
            type="checkbox"
            id="green-line"
            onChange={(evt) => {
              if (evt.target.checked) {
                setZones(fp.union(greenLineSignIds, zones));
              } else {
                setZones(fp.without(greenLineSignIds, zones));
              }
            }}
            checked={greenLineSignIds.every((signId) => zones.includes(signId))}
          />

          <div className="branches-col">
            {["B", "C", "D", "E"].map((branch) => {
              // It's possible to check a station on one branch even though not all signs are checked.
              // If you want to instead select all branches when selecting a station,
              // pass GREEN_LINE_ROUTES to routes and pass route to orderingRoute
              const route = `Green-${branch}`;
              return (
                <RouteColumn
                  key={branch}
                  label={`${branch} branch`}
                  routeIds={[route]}
                  places={placesByRoute[route]}
                  value={zones}
                  onChange={setZones}
                />
              );
            })}
          </div>
        </div>

        {Object.keys(ROUTE_TO_CLASS_NAMES_MAP).map((route) => (
          <div
            key={route}
            className={`route-col ${ROUTE_TO_CLASS_NAMES_MAP[route]} col`}
          >
            <RouteColumn
              label={`${route} line`}
              orderingRouteId={route}
              routeIds={routeNameToRouteIds[route]}
              places={placesByRoute[route]}
              value={zones}
              onChange={setZones}
              reverse={route === "Blue"}
            />
          </div>
        ))}

        <div className="route-col route-col--bus col">
          <RouteColumn
            label="Bus"
            routeIds={busRoutes}
            places={placesByRoute["Bus"]}
            value={zones}
            onChange={setZones}
          />
        </div>
      </Container>
    </div>
  );
};

export default SelectStationsPage;
