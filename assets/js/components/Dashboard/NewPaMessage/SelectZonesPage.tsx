import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Page } from "./types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import fp from "lodash/fp";
import { Screen } from "Models/screen";
import { getZoneLabel, sortByStationOrder } from "../../../util";
import cx from "classnames";
import { Dot } from "react-bootstrap-icons";
import { useRouteToRouteIDsMap } from "./hooks";

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
  value: string[];
  onChange: (signs: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
}

const SelectZonesPage = ({ value, onChange, navigateTo, places }: Props) => {
  const [signs, setSigns] = useState(value);
  const [leftScreens, setLeftScreens] = useState<Screen[]>([]);
  const [middleScreens, setMiddleScreens] = useState<Screen[]>([]);
  const [rightScreens, setRightScreens] = useState<Screen[]>([]);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("");
  const routeToRouteIDMap = useRouteToRouteIDsMap();

  const directionLabels = [
    "Green",
    "Green-B",
    "Green-C",
    "Green-D",
    "Green-E",
    "Blue",
  ].includes(selectedRouteFilter)
    ? { left: "Westbound", right: "Eastbound" }
    : { left: "Northbound", right: "Southbound" };

  const selectedRoutes = useMemo(
    () =>
      fp.flow(
        fp.flatMap((place: Place) =>
          place.screens.filter((s) => value.includes(s.id)),
        ),
        fp.flatMap((screen: Screen) => screen.route_ids),
        fp.uniq,
        fp.groupBy((routeID: string) => {
          if (routeID.startsWith("Green")) {
            return "Green";
          }

          if (routeToRouteIDMap["Bus"].includes(routeID)) {
            return "Bus";
          }

          if (routeToRouteIDMap["Silver"].includes(routeID)) {
            return "Silver";
          }

          return routeID;
        }),
        fp.tap((routes) => setSelectedRouteFilter(Object.keys(routes)[0])),
      )(places),
    [places],
  );

  const filteredPlaces = places.filter(
    (p) =>
      places
        .filter((p) => p.screens.some((s) => value.includes(s.id)))
        .map((p) => p.id)
        .includes(p.id) &&
      p.screens.some((s) =>
        s.route_ids?.some((r) =>
          routeToRouteIDMap[selectedRouteFilter]?.some((a) => r === a),
        ),
      ),
  );

  const allScreens = useMemo(
    () =>
      filteredPlaces.flatMap((p) => {
        return p.screens.filter((s) =>
          s.route_ids?.some((r) => r.startsWith(selectedRouteFilter)),
        );
      }),
    [selectedRouteFilter],
  );

  useEffect(() => {
    setLeftScreens(allScreens.filter((s) => ["s", "w"].includes(s.zone!!)));
    setMiddleScreens(allScreens.filter((s) => ["c", "m"].includes(s.zone!!)));
    setRightScreens(allScreens.filter((s) => ["n", "e"].includes(s.zone!!)));
  }, [selectedRouteFilter]);

  const selectedMassSelectButton = useMemo(() => {
    if (!leftScreens.length && !rightScreens.length) return "";

    if (
      signs.length &&
      [...leftScreens, ...middleScreens, ...rightScreens].every((s) =>
        signs.includes(s.id),
      )
    ) {
      return "All";
    } else if (
      [...leftScreens, ...middleScreens].every((s) => signs.includes(s.id))
    ) {
      return "Left";
    } else if (
      [...middleScreens, ...rightScreens].every((s) => signs.includes(s.id))
    ) {
      return "Right";
    }
  }, [signs, selectedRouteFilter]);

  const massSelectScreens = (
    screensToAdd: Screen[],
    screensToRemove: Screen[],
  ) => {
    fp.flow(
      fp.without(screensToRemove.map((s) => s.id)),
      fp.concat(screensToAdd.map((s) => s.id)),
      fp.uniq,
      fp.tap((s) => setSigns(s)),
    )(signs);
  };

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
              onClick={() => {
                onChange(signs);
                navigateTo(Page.STATIONS);
              }}
            >
              Edit Stations
            </Button>
          </div>
        </div>
        <div className="buttons">
          <Button
            className="cancel-button"
            onClick={() => {
              navigateTo(Page.NEW);
            }}
          >
            Cancel
          </Button>
          <Button
            className="submit-button"
            onClick={() => {
              onChange(signs);
              navigateTo(Page.NEW);
            }}
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
              let branchFilters;
              if (routeID === "Green") {
                branchFilters = selectedRoutes["Green"]
                  .sort()
                  .map((branchID) => {
                    const branch = branchID.split("-")[1];

                    return (
                      <Button
                        key={`branch-filter-${branch}`}
                        onClick={() => setSelectedRouteFilter(branchID)}
                        className={cx(
                          "filter-button",
                          ROUTE_TO_CLASS_NAMES_MAP["Green"],
                          {
                            selected: selectedRouteFilter === branchID,
                          },
                        )}
                      >
                        <Dot /> {branch} Branch
                      </Button>
                    );
                  });
              }

              return (
                <Fragment key={`route-filter-${routeID}`}>
                  <Button
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
                  {branchFilters}
                </Fragment>
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
              <Button
                className={cx({ selected: selectedMassSelectButton === "All" })}
                onClick={() => {
                  setSigns(
                    fp.concat(fp.uniq(allScreens.map((s) => s.id)), signs),
                  );
                }}
              >
                All Zones (except bus)
              </Button>
              <Button
                className={cx({
                  selected: selectedMassSelectButton === "Left",
                })}
                onClick={() => {
                  massSelectScreens(
                    [...leftScreens, ...middleScreens],
                    rightScreens,
                  );
                }}
              >
                {directionLabels.left}
              </Button>
              <Button
                className={cx({
                  selected: selectedMassSelectButton === "Right",
                })}
                onClick={() => {
                  massSelectScreens(
                    [...rightScreens, ...middleScreens],
                    leftScreens,
                  );
                }}
              >
                {directionLabels.right}
              </Button>
            </div>
          </div>
          <table className="zones-table">
            <thead>
              <tr className="table-header">
                <th></th>
                <th>All</th>
                <th>{directionLabels.left}</th>
                <th>
                  {directionLabels.left} & {directionLabels.right}
                </th>
                <th>{directionLabels.right}</th>
              </tr>
            </thead>
            <tbody>
              {sortByStationOrder(filteredPlaces, selectedRouteFilter).map(
                (place) => (
                  <PlaceZonesRow
                    key={`place-zones-row-${place.id}`}
                    place={places.find((p) => p.id === place.id)}
                    allSelectedSigns={signs}
                    setSigns={setSigns}
                    route={selectedRouteFilter}
                    routeToRouteIDMap={routeToRouteIDMap}
                  />
                ),
              )}
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
  routeToRouteIDMap,
}: {
  place: Place | undefined;
  allSelectedSigns: string[];
  setSigns: (signs: string[]) => void;
  route: string;
  routeToRouteIDMap: { [key: string]: string[] };
}) => {
  if (!place) return null;

  const allSignsForRouteAtPlace = place.screens.filter((screen) =>
    fp.any(
      (r) => routeToRouteIDMap[route]?.some((a) => r.startsWith(a)),
      screen.route_ids,
    ),
  );

  const selectedSignsAtPlace = fp.flow(
    fp.map((s: Screen) => s.id),
    fp.filter((id: string) => allSelectedSigns.includes(id)),
  )(allSignsForRouteAtPlace);

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

  const allSignsSelected = useMemo(
    () => selectedSignsAtPlace.length === allSignsForRouteAtPlace.length,
    [allSelectedSigns, route],
  );

  const placeBranches =
    route === "Green"
      ? fp
          .uniq(
            allSignsForRouteAtPlace.flatMap((s) =>
              s.route_ids?.map((r) => r.split("-")[1]),
            ),
          )
          .sort()
      : [];

  return (
    <tr className="table-row">
      <td>
        <div className="place-name-container">
          {placeBranches.length > 0 && (
            <div className={`route ${ROUTE_TO_CLASS_NAMES_MAP["Green"]}`}>
              {placeBranches.join(" ")}
            </div>
          )}
          <div className="place-name">{place.name}</div>
        </div>
      </td>
      <td className="cell all-button-cell">
        <Button
          className={cx({
            selected: allSignsSelected,
          })}
          onClick={() => {
            const signIDsAtPlace = allSignsForRouteAtPlace.map((s) => s.id);
            if (allSignsSelected) {
              setSigns(fp.without(signIDsAtPlace, allSelectedSigns));
            } else {
              setSigns(fp.uniq(allSignsForRouteAtPlace.map((s) => s.id)));
            }
          }}
        >
          All
        </Button>
      </td>
      <td className="cell left-cell">
        <div className="sign-button-group">
          {signsInZones(["s", "w"]).map((sign) => {
            return (
              <SelectSignButton
                key={sign.id}
                sign={sign}
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              />
            );
          })}
        </div>
      </td>
      <td className="cell middle-cell">
        <div className="sign-button-group">
          {signsInZones(["c", "m"]).map((sign) => {
            return (
              <SelectSignButton
                key={sign.id}
                sign={sign}
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              />
            );
          })}
        </div>
      </td>
      <td className="cell right-cell">
        <div className="sign-button-group">
          {signsInZones(["n", "e"]).map((sign) => {
            return (
              <SelectSignButton
                key={sign.id}
                sign={sign}
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              />
            );
          })}
        </div>
      </td>
    </tr>
  );
};

interface SelectSignButtonProps {
  sign: Screen;
  isSelected: boolean;
  onClick: () => void;
}

const SelectSignButton = ({
  sign,
  isSelected,
  onClick,
}: SelectSignButtonProps) => {
  return (
    <Button
      className={cx({
        selected: isSelected,
      })}
      onClick={onClick}
    >
      {sign.label ?? getZoneLabel(sign.zone!!)}
    </Button>
  );
};

export default SelectZonesPage;
