import React, { useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import _ from "lodash";
import { useScreenplayContext } from "Hooks/useScreenplayContext";
import { sortByStationOrder } from "../../../util"; // TODO: Move this file
import type { Place } from "Models/place";

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

  const orangeLineZones = placesByRoute["Orange"].flatMap((place) =>
    place.screens
      .filter((screen) => screen.route_ids?.includes("Orange"))
      .map((screen) => screen.id),
  );

  return (
    <div className="new-pa-message-page">
      <div className="new-pa-message-page__header">Select Stations</div>
      <Container fluid>
        <div>
          <div>
            <label>
              <input
                type="checkbox"
                onChange={(evt) => {
                  if (evt.target.checked) {
                    setZones((currentZones) =>
                      _.union(currentZones, orangeLineZones),
                    );
                  } else {
                    setZones((currentZones) =>
                      _.without(currentZones, ...orangeLineZones),
                    );
                  }
                }}
                checked={orangeLineZones.every((zone) => zones.includes(zone))}
              />
              Orange Line
            </label>
          </div>
          <ol>
            {sortByStationOrder(placesByRoute["Orange"], "Orange").map(
              // TODO: Need to capitalize terminal stops
              (place) => {
                const placeZones = place.screens
                  .filter((screen) => screen.route_ids?.includes("Orange"))
                  .map((screen) => screen.id);
                return (
                  <li key={place.id}>
                    <label>
                      <input
                        type="checkbox"
                        onChange={(evt) => {
                          if (evt.target.checked) {
                            setZones((currentZones) =>
                              _.union(currentZones, placeZones),
                            );
                          } else {
                            setZones((currentZones) =>
                              _.without(currentZones, ...placeZones),
                            );
                          }
                        }}
                        checked={zones.some((zone) =>
                          placeZones.includes(zone),
                        )}
                      />
                      {place.name}
                    </label>
                  </li>
                );
              },
            )}
          </ol>
        </div>
      </Container>
    </div>
  );
};

export default SelectStationsPage;
