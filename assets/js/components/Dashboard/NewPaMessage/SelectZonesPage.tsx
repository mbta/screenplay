import React, { Fragment, useMemo, useState } from "react";
import { Page } from "./types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import fp from "lodash/fp";
import { Screen } from "Models/screen";
import { getZoneLabel, signIDs, sortByStationOrder } from "../../../util";
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

const LEFT_ZONES = ["s", "w"] as const;
const MIDDLE_ZONES = ["c", "m"] as const;
const RIGHT_ZONES = ["n", "e"] as const;

const SelectZonesPage = ({ value, onChange, navigateTo, places }: Props) => {
  const [signs, setSigns] = useState(value);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("");
  const routeToRouteIDMap = useRouteToRouteIDsMap();

  const isSelected = (id: string) => signs.includes(id);

  const directionLabels = useMemo(() => {
    switch (selectedRouteFilter) {
      case "Green":
      case "Green-B":
      case "Green-C":
      case "Green-D":
      case "Green-E":
      case "Blue":
        return {
          left: "Westbound",
          middle: "Westbound & Eastbound",
          right: "Eastbound",
        };
      case "Silver":
        return { left: "To South Station/Downtown", right: "Eastbound" };
      case "Bus":
        return { left: "", middle: "", right: "" };
      default:
        return {
          left: "Southbound",
          middle: "Southbound & Northbound",
          right: "Northbound",
        };
    }
  }, [selectedRouteFilter]);

  const massSelectButtonLabels = useMemo(() => {
    if (selectedRouteFilter === "Silver") {
      return {
        left: "Both",
        middle: "South Station/Downtown",
        right: "Outbound Content",
      };
    }

    return {
      left: "All Zones (except bus)",
      middle: directionLabels.left,
      right: directionLabels.right,
    };
  }, [selectedRouteFilter]);

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
        return p.screens.filter(
          (s) =>
            fp.intersection(routeToRouteIDMap[selectedRouteFilter], s.route_ids)
              .length > 0,
        );
      }),
    [selectedRouteFilter],
  );

  const screensByZone = useMemo(() => {
    const screensWithAZone = allScreens.filter((s) => s.zone);
    return fp.groupBy((s) => s.zone, screensWithAZone);
  }, [allScreens]);

  const areAllGroupsSelected = (groups: Array<ReadonlyArray<string>>) =>
    groups.every((group) =>
      group.every((zone) => {
        return signIDs(screensByZone[zone] ?? []).every(isSelected);
      }),
    );

  const selectGroups = (groups: Array<ReadonlyArray<string>>) => {
    const signsWithoutSelectedRoute = fp.without(signIDs(allScreens), signs);

    const newScreens = groups.flatMap((group) =>
      group.flatMap((zone) => signIDs(screensByZone[zone] ?? [])),
    );

    setSigns(fp.uniq([...signsWithoutSelectedRoute, ...newScreens]));
  };

  const isAllSelected =
    signs.length &&
    areAllGroupsSelected([LEFT_ZONES, MIDDLE_ZONES, RIGHT_ZONES]);
  const isLeftSelected =
    !isAllSelected && areAllGroupsSelected([LEFT_ZONES, MIDDLE_ZONES]);
  const isRightSelected =
    !isAllSelected && areAllGroupsSelected([MIDDLE_ZONES, RIGHT_ZONES]);

  const hasRailFilter = () =>
    [
      "Green",
      "Green-B",
      "Green-C",
      "Green-D",
      "Green-E",
      "Blue",
      "Red",
      "Orange",
      "Mattapan",
    ].includes(selectedRouteFilter);

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
            {selectedRouteFilter !== "Bus" && (
              <div className="mass-select-button-container">
                <Button
                  className={cx({ selected: isAllSelected })}
                  onClick={() =>
                    selectGroups([LEFT_ZONES, MIDDLE_ZONES, RIGHT_ZONES])
                  }
                >
                  {massSelectButtonLabels.left}
                </Button>
                <Button
                  className={cx({
                    selected: isLeftSelected,
                  })}
                  onClick={() => selectGroups([LEFT_ZONES, MIDDLE_ZONES])}
                >
                  {massSelectButtonLabels.middle}
                </Button>
                <Button
                  className={cx({
                    selected: isRightSelected,
                  })}
                  onClick={() => selectGroups([MIDDLE_ZONES, RIGHT_ZONES])}
                >
                  {massSelectButtonLabels.right}
                </Button>
              </div>
            )}
          </div>
          <table className="zones-table">
            <thead>
              <tr className="table-header">
                <th></th>
                <th>All</th>
                <th>{directionLabels.left}</th>
                <th>{directionLabels.middle}</th>
                <th>{directionLabels.right}</th>
              </tr>
            </thead>
            <tbody>
              {sortByStationOrder(filteredPlaces, selectedRouteFilter).map(
                (place) => {
                  return (
                    <Fragment key={`place-zones-row-${place.id}`}>
                      <PlaceZonesRow
                        place={place}
                        allSelectedSigns={signs}
                        setSigns={setSigns}
                        route={selectedRouteFilter}
                        routeToRouteIDMap={routeToRouteIDMap}
                      />
                      {hasRailFilter() && (
                        <PlaceZonesRow
                          place={place}
                          allSelectedSigns={signs}
                          setSigns={setSigns}
                          route={"Bus"}
                          routeToRouteIDMap={routeToRouteIDMap}
                        />
                      )}
                    </Fragment>
                  );
                },
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
  place: Place;
  allSelectedSigns: string[];
  setSigns: (signs: string[]) => void;
  route: string;
  routeToRouteIDMap: { [key: string]: string[] };
}) => {
  const allSignsForRouteAtPlace = place.screens.filter((screen) =>
    fp.any(
      (r) => routeToRouteIDMap[route]?.some((a) => r.startsWith(a)),
      screen.route_ids,
    ),
  );

  if (allSignsForRouteAtPlace.length === 0) return null;

  const selectedSignsAtPlace = signIDs(allSignsForRouteAtPlace).filter(
    (id: string) => allSelectedSigns.includes(id),
  );

  const signsInZones = (zones: ReadonlyArray<string>) => {
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
          {route === "Bus" && (
            <div className={`route ${ROUTE_TO_CLASS_NAMES_MAP["Bus"]}`}>
              Bus
            </div>
          )}
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
          {signsInZones(LEFT_ZONES).map((sign) => {
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
          {signsInZones(MIDDLE_ZONES).map((sign) => {
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
          {signsInZones(RIGHT_ZONES).map((sign) => {
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
