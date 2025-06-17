import {
  usePredictionSuppressionState,
  useScreenplayState,
} from "Hooks/useScreenplayContext";
import { RadioList } from "Components/RadioList";
import MapSegment from "Components/MapSegment";
import React, { ReactNode, useEffect, useState } from "react";
import fp from "lodash/fp";
import * as styles from "Styles/prediction-suppression.module.scss";
import { Dot, XCircleFill } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import { sortByStationOrder } from "../../util";
import { Place } from "Models/place";
import {
  createSuppressedPrediction,
  deleteSuppressedPrediction,
  updateSuppressedPrediction,
} from "Utils/api";
import { SuppressedPrediction } from "Models/suppressed_prediction";
import STATION_ORDER_BY_LINE from "Constants/stationOrder";
import { useUniqueId } from "Hooks/useUniqueId";
import { useSearchParams } from "react-router-dom";
import cx from "classnames";
import { isSuppressionAdmin } from "Utils/auth";

const lookupKey = fp.join(":");

const directionNames = (line: string) => {
  switch (line.split("-")[0]) {
    case "Green":
    case "Blue":
      return ["Westbound", "Eastbound"];
    case "Silver":
      return ["Eastbound", "To South Station/Downtown"];
    case "Mattapan":
      return ["Outbound", "Inbound"];
    default:
      return ["Southbound", "Northbound"];
  }
};

const PredictionSuppressionPage = () => {
  const [params, setParams] = useSearchParams();
  const [line, setLine] = useState<string>(params.get("line") || "Green");
  const { places, lineStops } = useScreenplayState();
  const { suppressedPredictions, mutateSuppressedPredictions } =
    usePredictionSuppressionState();
  const isAdmin = isSuppressionAdmin();

  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("line", line);
    setParams(newParams, { replace: true });
  }, [setParams, line]);

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

  const mainLine = fp.startsWith("Green", line) ? "Green" : line;

  const lineStopLookup = fp.flow([
    fp.filter({ line: line.split("-")[0] }),
    fp.map(({ stop_id, direction_id, suppression_type }) => [
      lookupKey([stop_id, direction_id]),
      suppression_type,
    ]),
    fp.fromPairs,
  ])(lineStops);

  const suppressedPredictionsLookup = fp.flow([
    fp.map((p: SuppressedPrediction) => [
      lookupKey([p.location_id, p.route_id, p.direction_id]),
      p,
    ]),
    fp.fromPairs,
  ])(suppressedPredictions);

  const suppressedPredictionCounts = fp.countBy(
    "route_id",
    suppressedPredictions,
  );

  const noPredictions = (place: Place) => {
    return [0, 1].every((d) => !lineStopLookup[lookupKey([place.id, d])]);
  };

  const placeStation = (place: Place) =>
    STATION_ORDER_BY_LINE[line.toLowerCase()].find(
      (station) => station.name.toLowerCase() === place.name.toLowerCase(),
    );

  const renderMapSegment = (place: Place) => {
    const station = placeStation(place);

    if (station) {
      return (
        <MapSegment
          station={station}
          line={line.toLowerCase()}
          className={styles.mapSegment}
        />
      );
    }
  };

  const renderPills = (place: Place) => {
    const station = placeStation(place);
    if (station?.pills) {
      return (
        <div className="d-flex gap-2 mt-2">
          {station.pills.map((name) => (
            <div key={name} className={styles.pill}>
              {name}
            </div>
          ))}
        </div>
      );
    }
  };

  const renderInput = (
    locationId: string,
    stopId: string,
    directionId: number,
  ) => {
    const suppressionType = lineStopLookup[lookupKey([stopId, directionId])];
    const record =
      suppressedPredictionsLookup[
        lookupKey([locationId, mainLine, directionId])
      ];

    const toggleSuppression = () => {
      if (!suppressedPredictions) {
        return;
      }
      if (record) {
        const newData = fp.without([record], suppressedPredictions);
        mutateSuppressedPredictions(
          async () => {
            await deleteSuppressedPrediction(record);
            return newData;
          },
          { optimisticData: newData },
        );
      } else {
        const newRecord = {
          location_id: locationId,
          route_id: mainLine,
          direction_id: directionId,
          clear_at_end_of_day: false,
        };
        const newData = fp.concat(suppressedPredictions, [newRecord]);
        mutateSuppressedPredictions(
          async () => {
            await createSuppressedPrediction(newRecord);
            return newData;
          },
          { optimisticData: newData },
        );
      }
    };

    const toggleExpiration = () => {
      if (!suppressedPredictions) {
        return;
      }
      const newRecord = fp.update(["clear_at_end_of_day"], (v) => !v, record);
      const newData = fp.map(
        (p) => (p === record ? newRecord : p),
        suppressedPredictions,
      );
      mutateSuppressedPredictions(
        async () => {
          await updateSuppressedPrediction(newRecord);
          return newData;
        },
        { optimisticData: newData },
      );
    };

    if (suppressionType) {
      const predictionsText =
        suppressionType === "terminal" ? "terminal predictions" : "predictions";
      return (
        (!!record || isAdmin) && (
          <>
            <label className={styles.suppressionLabel}>
              <input
                type="checkbox"
                checked={!!record}
                onChange={toggleSuppression}
                className={styles.suppressionCheckbox}
                disabled={!isAdmin}
              />
              {!!record && isAdmin && <XCircleFill className="me-2" />}
              {fp.capitalize(
                record
                  ? `${predictionsText} suppressed`
                  : `suppress ${predictionsText}`,
              )}
            </label>
            {!!record && (
              <IdContainer>
                {(id) => (
                  <Form.Check
                    id={id}
                    className="mt-2 mb-0"
                    label="Clear at end of service day"
                    checked={record.clear_at_end_of_day}
                    onChange={toggleExpiration}
                    disabled={!isAdmin}
                  />
                )}
              </IdContainer>
            )}
          </>
        )
      );
    }
  };

  const renderCell = (place: Place, directionId: number) => {
    if (place.id === "place-jfk") {
      return (
        <>
          <div>Ashmont platform</div>
          {renderInput("jfk_umass_ashmont_platform", place.id, directionId)}
          <div className="mt-3">Braintree platform</div>
          {renderInput("jfk_umass_braintree_platform", place.id, directionId)}
        </>
      );
    }
    return renderInput(place.id, place.id, directionId);
  };

  const filterContent = (line: string) => {
    return (
      <>
        <span>{line} Line</span>
        <span className={cx(styles.badge, "ms-auto")}>
          {suppressedPredictionCounts[line]}
        </span>
      </>
    );
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
                content: filterContent("Green"),
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
                content: filterContent("Red"),
              },
              {
                value: "Blue",
                checkedClass: "bg-mbta-blue",
                content: filterContent("Blue"),
              },
              {
                value: "Orange",
                checkedClass: "bg-mbta-orange",
                content: filterContent("Orange"),
              },
              {
                value: "Silver",
                checkedClass: "bg-mbta-silver",
                content: filterContent("Silver"),
              },
              {
                value: "Mattapan",
                checkedClass: "bg-mbta-red",
                content: filterContent("Mattapan"),
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
                <td
                  style={{ paddingLeft: line === "Silver" ? "1rem" : 68 }}
                  className="pe-3 py-4 position-relative overflow-hidden align-top"
                >
                  {place.name}
                  {renderMapSegment(place)}
                  {renderPills(place)}
                </td>
                {noPredictions(place) ? (
                  <td colSpan={2} className="p-3">
                    <em className="text-secondary">
                      Predictions aren't generated for this location
                    </em>
                  </td>
                ) : (
                  [0, 1].map((directionId) => (
                    <td key={directionId} className="p-3 align-top">
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

const IdContainer = ({ children }: { children: (id: string) => ReactNode }) => {
  const id = useUniqueId();
  return children(id);
};

export default PredictionSuppressionPage;
