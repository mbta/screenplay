import React, { useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import { useScreenplayContext } from "Hooks/useScreenplayContext";
import type { Place } from "Models/place";
import RouteColumn from "./RouteColumn";

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

const SelectStationsPage = () => {
  const [zones, setZones] = useState<string[]>([]);
  const places = usePlacesWithPaEss();
  if (places.length === 0) return null; // TODO: Ensure places loaded by context bofore rendering

  const placesByRoute = places.reduce<{ [key: string]: Array<Place> }>(
    (acc, place) => {
      const routes = [
        ...new Set(
          place.routes.map((r) => (r.startsWith("Green") ? "Green" : r)),
        ),
      ];
      routes.forEach((route) => {
        acc[route] = [...(acc[route] || []), place];
      });
      return acc;
    },
    {},
  );

  return (
    <div className="new-pa-message-page">
      <div className="new-pa-message-page__header">Select Stations</div>
      <Container fluid>
        {["Red", "Orange", "Blue", "Mattapan"].map((route) => (
          <RouteColumn
            key={route}
            label={`${route} line`}
            route={route}
            places={placesByRoute[route]}
            value={zones}
            onChange={setZones}
            reverse={route === "Blue"}
          />
        ))}
      </Container>
    </div>
  );
};

export default SelectStationsPage;
