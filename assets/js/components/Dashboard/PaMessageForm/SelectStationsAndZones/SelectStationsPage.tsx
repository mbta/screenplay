import React from "react";
import { Button, Container, Form } from "react-bootstrap";
import fp from "lodash/fp";
import type { Place } from "Models/place";
import RouteColumn from "./RouteColumn";
import { GREEN_LINE_ROUTES } from "Constants/constants";
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
import { Page } from "../types";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import { getRouteIdsForSign, sortRoutes } from "../../../../util";

const ROUTE_TO_CLASS_NAMES_MAP: { [key: string]: string } = {
  Red: "route-col--red",
  Orange: "route-col--orange",
  Blue: "route-col--blue",
  Mattapan: "route-col--mattapan",
  Silver: "route-col--silver",
};

interface Props {
  places: Place[];
  value: string[];
  onChange: (signIds: string[]) => void;
  navigateTo: (page: Page) => void;
  busRoutes: string[];
  onError: (message: string | null) => void;
  isReadOnly?: boolean;
}

const SelectStationsPage = ({
  places,
  value,
  onChange,
  navigateTo,
  busRoutes,
  onError,
  isReadOnly = false,
}: Props) => {
  const routeNameToRouteIds = useRouteToRouteIDsMap();

  if (places.length === 0) return null;

  const placesByRoute = places.reduce<{ [key: string]: Array<Place> }>(
    (acc, place) => {
      place.routes.forEach((route) => {
        const groupedRoutes = routeNameToRouteIds[route];
        if (
          place.screens.some(
            (screen) =>
              fp.intersection(groupedRoutes, getRouteIdsForSign(screen))
                .length > 0,
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
              fp.intersection(GREEN_LINE_ROUTES, getRouteIdsForSign(screen))
                .length > 0,
          )
          .map((screen) => screen.id),
    ),
  );

  return (
    <div className="select-stations-page">
      <div className="header">
        <div>{isReadOnly ? "Stations" : "Select Stations"}</div>
        <div className="buttons">
          <Button
            className="cancel-button"
            onClick={() => navigateTo(Page.MAIN)}
          >
            {isReadOnly ? "Back" : "Cancel"}
          </Button>
          <Button
            className="submit-button button-primary"
            onClick={() => {
              if (!value.length) {
                onError("Select a station to review zones.");
              } else {
                navigateTo(Page.ZONES);
              }
            }}
          >
            Review Zones
          </Button>
        </div>
      </div>
      <SelectedStationsSummary
        places={places}
        value={value}
        onChange={onChange}
        busRoutes={busRoutes}
        isReadOnly={isReadOnly}
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
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="GL D Branch"
                label="Kenmore-Riverside"
                places={places}
                routes={["Green-D"]}
                stations={GL_D_BRANCH}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="GL E Branch"
                label="Prudential-Symphony"
                places={places}
                routes={["Green-E"]}
                stations={GL_E_BRANCH}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="GLX"
                label="Medford/Tufts-North Station"
                places={places}
                routes={["Green-D", "Green-E"]}
                stations={GLX}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
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
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="Ashmont Branch"
                label="JFK-Ashmont"
                places={places}
                routes={["Red"]}
                stations={RED_ASHMONT_BRANCH}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="Red Line Trunk"
                label="Alewife-JFK"
                places={places}
                routes={["Red"]}
                stations={RED_TRUNK}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
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
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
              />
              <StationGroupCheckbox
                title="South"
                label="Haymarket-Forest Hills"
                places={places}
                routes={["Orange"]}
                stations={ORANGE_SOUTH}
                value={value}
                onChange={onChange}
                disabled={isReadOnly}
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
                onChange(fp.union(greenLineSignIds, value));
              } else {
                onChange(fp.without(greenLineSignIds, value));
              }
            }}
            checked={greenLineSignIds.every((signId) => value.includes(signId))}
            disabled={isReadOnly}
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
                  value={value}
                  onChange={onChange}
                  disabled={isReadOnly}
                />
              );
            })}
          </div>
        </div>

        {sortRoutes(Object.keys(ROUTE_TO_CLASS_NAMES_MAP)).map((route) => (
          <div
            key={route}
            className={`route-col ${ROUTE_TO_CLASS_NAMES_MAP[route]} col`}
          >
            <RouteColumn
              label={`${route} line`}
              orderingRouteId={route}
              routeIds={routeNameToRouteIds[route]}
              places={placesByRoute[route]}
              value={value}
              onChange={onChange}
              reverse={route === "Blue"}
              disabled={isReadOnly}
            />
          </div>
        ))}

        <div className="route-col route-col--bus col">
          <RouteColumn
            label="Bus"
            routeIds={busRoutes}
            places={placesByRoute["Bus"]}
            value={value}
            onChange={onChange}
            disabled={isReadOnly}
          />
        </div>
      </Container>
    </div>
  );
};

export default SelectStationsPage;
