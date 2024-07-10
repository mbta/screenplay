import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import { useScreenplayContext } from "Hooks/useScreenplayContext";
import type { Place } from "Models/place";

const usePlacesWithPaEss = () => {
  const { places } = useScreenplayContext();
  return useMemo(
    () =>
      places.filter((place) =>
        place.screens.some((screen) => screen.type === "pa_ess"),
      ),
    [places],
  );
};

const SelectStationsPage = () => {
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
        <div>
          <div>Orange Line</div>
          <ol>
            {placesByRoute["Orange"].map((place) => (
              <li key={place.id}>{place.name}</li>
            ))}
          </ol>
        </div>
      </Container>
    </div>
  );
};

export default SelectStationsPage;
