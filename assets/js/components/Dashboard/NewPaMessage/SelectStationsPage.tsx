import React, { useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import _ from "lodash";
import { useScreenplayContext } from "Hooks/useScreenplayContext";
import type { Place } from "Models/place";
import RouteColumn from "./RouteColumn";
import { GREEN_LINE_ROUTES, SILVER_LINE_ROUTES } from "Constants/constants";
import StationGroupCheckbox from "./StationGroupCheckbox";
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

const usePlacesWithPaEss = () => {
  const { places } = useScreenplayContext();
  return useMemo(
    () =>
      places
        .map((place) => ({
          ...place,
          screens: place.screens.filter((screen) => screen.type === "pa_ess"),
        }))
        .filter((place: Place) => place.screens.length > 0),
    [places],
  );
};

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

const SelectStationsPage = () => {
  const [zones, setZones] = useState<string[]>([]);
  const places = usePlacesWithPaEss();
  if (places.length === 0) return null; // TODO: Ensure places loaded by context bofore rendering

  // TODO: Extract all places / zones / routes / screens transforming logic
  const allRoutes = _.uniq(
    places.flatMap((place) =>
      place.screens.flatMap((screen) => screen.route_ids ?? []),
    ),
  );
  const busRoutes = _.without(
    allRoutes,
    ...Object.values(BASE_PLACE_ROUTE_TO_ROUTE_IDS).flat(),
  );

  const PLACE_ROUTE_TO_ROUTE_IDS: { [key: string]: string[] } = {
    ...BASE_PLACE_ROUTE_TO_ROUTE_IDS,
    Bus: busRoutes,
  };

  const placesByRoute = places.reduce<{ [key: string]: Array<Place> }>(
    (acc, place) => {
      place.routes.forEach((route) => {
        const groupedRoutes = PLACE_ROUTE_TO_ROUTE_IDS[route];
        if (
          place.screens.some(
            (screen) =>
              _.intersection(screen.route_ids, groupedRoutes).length > 0,
          )
        ) {
          acc[route] = [...(acc[route] || []), place];
        }
      });
      return acc;
    },
    {},
  );

  const greenLineZones = _.uniq(
    GREEN_LINE_ROUTES.flatMap((route) => placesByRoute[route]).flatMap(
      (place) =>
        place.screens
          .filter(
            (screen) =>
              _.intersection(screen.route_ids ?? [], GREEN_LINE_ROUTES).length >
              0,
          )
          .map((screen) => screen.id),
    ),
  );

  return (
    <div className="new-pa-message-page">
      <div className="new-pa-message-page__header">Select Stations</div>
      <Container fluid>
        <div>
          <div>Station Groups</div>
          <div>
            <div>Green line</div>
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
              label="Pru, Sym, Longwood"
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
          </div>
          <div>
            <div>Red line</div>
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
          </div>
          <div>
            <div>Orange line</div>
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
        <div>
          <label>
            <input
              type="checkbox"
              onChange={(evt) => {
                if (evt.target.checked) {
                  setZones(_.union(zones, greenLineZones));
                } else {
                  setZones(_.without(zones, ...greenLineZones));
                }
              }}
              checked={greenLineZones.every((zone) => zones.includes(zone))}
            />
            Green line
          </label>

          <ol>
            {["B", "C", "D", "E"].map((branch) => {
              // It's possible to check a station on one branch even though not all zones are checked.
              // If you want to instead select all branches when selecting a station,
              // pass GREEN_LINE_ROUTES to routes and pass route to orderingRoute
              const route = `Green-${branch}`;
              return (
                <RouteColumn
                  key={branch}
                  label={`${branch} branch`}
                  routes={[route]}
                  places={placesByRoute[route]}
                  value={zones}
                  onChange={setZones}
                />
              );
            })}
          </ol>
        </div>

        {["Red", "Orange", "Blue", "Mattapan", "Silver"].map((route) => (
          <RouteColumn
            key={route}
            label={`${route} line`}
            orderingRoute={route}
            routes={PLACE_ROUTE_TO_ROUTE_IDS[route]}
            places={placesByRoute[route]}
            value={zones}
            onChange={setZones}
            reverse={route === "Blue"}
          />
        ))}

        <RouteColumn
          label="Bus"
          orderingRoute="Bus"
          routes={busRoutes}
          places={placesByRoute["Bus"]}
          value={zones}
          onChange={setZones}
        />
      </Container>
    </div>
  );
};

export default SelectStationsPage;
