import { useScreenplayContext } from "Hooks/useScreenplayContext";
import { RadioList } from "Components/RadioList";
import React, { useState } from "react";
import fp from "lodash/fp";
import * as styles from "Styles/prediction-suppression.module.scss";
import { Dot, XCircleFill } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import { sortByStationOrder } from "../../util";
import { Place } from "Models/place";

const lookupKey = (placeId: string, directionId: number) =>
  `${placeId}:${directionId}`;

const directionNames = (line: string) => {
  switch (line.split("-")[0]) {
    case "Green":
    case "Blue":
      return ["Westbound", "Eastbound"];
    case "Silver":
      return ["Eastbound", "To South Station/Downtown"];
    default:
      return ["Southbound", "Northbound"];
  }
};

const PredictionSuppressionPage = () => {
  const [line, setLine] = useState<string>("Green");
  const { places, lineStops } = useScreenplayContext();
  const filteredPlaces = sortByStationOrder(
    fp.filter(({ routes, screens }) => {
      switch (line) {
        case "Green":
          return fp.any(fp.startsWith("Green"), routes);
        case "Silver":
          return (
            fp.includes(line, routes) &&
            fp.any(
              (screen) =>
                screen.type === "pa_ess" &&
                fp.any(
                  ({ id }) => fp.includes(id, ["741", "742", "743", "746"]),
                  screen.routes,
                ),
              screens,
            )
          );
        default:
          return fp.includes(line, routes);
      }
    }, places),
    line,
  );
  const lineStopLookup = fp.flow([
    fp.filter({ line: line.split("-")[0] }),
    fp.map(({ stop_id, direction_id, type }) => [
      lookupKey(stop_id, direction_id),
      type,
    ]),
    fp.fromPairs,
  ])(lineStops);

  const noPredictions = (place: Place) => {
    const serviceType = lineStopLookup[lookupKey(place.id, 0)];
    return (
      line.startsWith("Green") && fp.includes(serviceType, ["start", "end"])
    );
  };

  const renderInput = (place: Place, directionId: number) => {
    const serviceType = lineStopLookup[lookupKey(place.id, directionId)];
    const suppressed = false;
    const expire = false;
    if (serviceType === "start" || serviceType === "mid") {
      const predictionsText =
        serviceType == "start" ? "terminal predictions" : "predictions";
      return (
        <>
          <label className={styles.suppressionLabel}>
            <input
              type="checkbox"
              checked={suppressed}
              onChange={() => {}}
              className={styles.suppressionCheckbox}
            />
            {suppressed && <XCircleFill className="me-2" />}
            {fp.capitalize(
              suppressed
                ? `${predictionsText} suppressed`
                : `suppress ${predictionsText}`,
            )}
          </label>
          {suppressed && (
            <Form.Check
              className="mt-2 mb-0"
              label="Clear at end of service day"
              checked={expire}
            />
          )}
        </>
      );
    }
  };

  const renderCell = (place: Place, directionId: number) => {
    if (place.id == "place-jfk") {
      return (
        <>
          <div>Ashmont platform</div>
          {renderInput(place, directionId)}
          <div>Braintree platform</div>
          {renderInput(place, directionId)}
        </>
      );
    }
    return renderInput(place, directionId);
  };

  return (
    <div className="ms-5 mt-4">
      <h1 className="mb-5">Suppress Predictions</h1>
      <div className="d-flex gap-5">
        <div style={{ flex: "0 0 200px" }}>
          <div className="mb-2">Filter by service line</div>
          <RadioList
            value={line}
            onChange={setLine}
            items={[
              {
                value: "Green",
                checkedClass: "bg-mbta-green",
                content: "Green Line",
              },
              {
                value: "Green-B",
                checkedClass: "bg-mbta-green",
                content: (
                  <>
                    <Dot /> B Branch
                  </>
                ),
              },
              {
                value: "Green-C",
                checkedClass: "bg-mbta-green",
                content: (
                  <>
                    <Dot /> C Branch
                  </>
                ),
              },
              {
                value: "Green-D",
                checkedClass: "bg-mbta-green",
                content: (
                  <>
                    <Dot /> D Branch
                  </>
                ),
              },
              {
                value: "Green-E",
                checkedClass: "bg-mbta-green",
                content: (
                  <>
                    <Dot /> E Branch
                  </>
                ),
              },
              {
                value: "Red",
                checkedClass: "bg-mbta-red",
                content: "Red Line",
              },
              {
                value: "Blue",
                checkedClass: "bg-mbta-blue",
                content: "Blue Line",
              },
              {
                value: "Orange",
                checkedClass: "bg-mbta-orange",
                content: "Orange Line",
              },
              {
                value: "Silver",
                checkedClass: "bg-mbta-silver",
                content: "Silver Line",
              },
            ]}
          />
        </div>
        <table style={{ flex: "1" }}>
          <thead className="sticky-top bg-dark">
            <tr>
              <th className="px-3 pb-3 fs-3" style={{ width: "30%" }}>
                {line} Line
              </th>
              {directionNames(line).map((name) => (
                <th
                  key={name}
                  className="px-3 pb-3 align-bottom text-secondary"
                  style={{ width: "35%" }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlaces.map((place) => (
              <tr key={place.id} className={styles.tableRow}>
                <td className="p-3">{place.name}</td>
                {noPredictions(place) ? (
                  <td colSpan={2} className="p-3">
                    <em className="text-secondary">
                      Predictions aren't generated for this location
                    </em>
                  </td>
                ) : (
                  [0, 1].map((directionId) => (
                    <td key={directionId} className="p-3">
                      {renderCell(place, directionId)}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div></div>
      </div>
    </div>
  );
};

export default PredictionSuppressionPage;
