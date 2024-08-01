import React, {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Page } from "../types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import fp from "lodash/fp";
import { Screen } from "Models/screen";
import { getZoneLabel, signIDs, sortByStationOrder } from "../../../../util";
import cx from "classnames";
import { ArrowLeftShort, ArrowRightShort, Dot } from "react-bootstrap-icons";
import { useRouteToRouteIDsMap } from "../hooks";
import { Dictionary } from "lodash";

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
  onChange: (signIds: string[]) => void;
  onSubmit: (signIds: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
}

const LEFT_ZONES = ["s", "w"] as const;
const MIDDLE_ZONES = ["c", "m"] as const;
const RIGHT_ZONES = ["n", "e"] as const;

const SelectZonesPage = ({
  value,
  onChange,
  onSubmit,
  navigateTo,
  places,
}: Props) => {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("");
  const [newPlaces, setNewPlaces] = useState<Place[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<Dictionary<string[]>>(
    {},
  );
  const routeToRouteIDMap = useRouteToRouteIDsMap();

  const isSelected = (id: string) => value.includes(id);

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

  useEffect(() => {
    const routes = fp.flow(
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
    )(places);

    setSelectedRoutes(routes);
    setSelectedRouteFilter(Object.keys(routes)[0]);
    setNewPlaces(
      places.filter((p) =>
        places
          .filter((p) => p.screens.some((s) => value.includes(s.id)))
          .map((p) => p.id)
          .includes(p.id),
      ),
    );
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return newPlaces.filter((p) =>
      p.screens.some((s) =>
        s.route_ids?.some((r) =>
          routeToRouteIDMap[selectedRouteFilter]?.some((a) => r === a),
        ),
      ),
    );
  }, [selectedRouteFilter]);

  const allScreens = useMemo(
    () =>
      filteredPlaces.flatMap((p) => {
        return p.screens.filter(
          (s) =>
            fp.intersection(routeToRouteIDMap[selectedRouteFilter], s.route_ids)
              .length > 0,
        );
      }),
    [filteredPlaces],
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
    const signsWithoutSelectedRoute = fp.without(signIDs(allScreens), value);

    const newScreens = groups.flatMap((group) =>
      group.flatMap((zone) => signIDs(screensByZone[zone] ?? [])),
    );

    onChange(fp.uniq([...signsWithoutSelectedRoute, ...newScreens]));
  };

  const isAllSelected =
    value.length > 0 &&
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

  const massSelectClassName = (selected: boolean) =>
    selected ? "button-primary" : "button-secondary-outline";

  const getFilterPillLabel = () => {
    if (selectedRouteFilter.startsWith("Green-")) {
      return `Green Line ${selectedRouteFilter.split("-")[1]}`;
    } else {
      return `${selectedRouteFilter} Line`;
    }
  };

  return (
    <div className="select-zones-page">
      <div className="header">
        <div className="title-and-edit">
          <div className="title">Review Zones</div>
          <div>
            <Button
              className="edit-button"
              onClick={() => navigateTo(Page.STATIONS)}
            >
              Edit Stations
            </Button>
          </div>
        </div>
        <div className="buttons">
          <Button
            className="cancel-button"
            onClick={() => navigateTo(Page.NEW)}
          >
            Cancel
          </Button>
          <Button
            className="button-primary"
            onClick={() => {
              onSubmit(value);
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
                          selectedRouteFilter === branchID
                            ? ROUTE_TO_CLASS_NAMES_MAP["Green"]
                            : "filter-button-default",
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
                      selectedRouteFilter === routeID
                        ? ROUTE_TO_CLASS_NAMES_MAP[routeID]
                        : "filter-button-default",
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
                className={`route ${ROUTE_TO_CLASS_NAMES_MAP[selectedRouteFilter.split("-")[0]]}`}
              >
                {getFilterPillLabel()}
              </div>
            </div>
            {selectedRouteFilter !== "Bus" && (
              <div className="mass-select-button-container">
                <Button
                  className={massSelectClassName(isAllSelected)}
                  onClick={() =>
                    selectGroups([LEFT_ZONES, MIDDLE_ZONES, RIGHT_ZONES])
                  }
                >
                  {massSelectButtonLabels.left}
                </Button>
                <Button
                  className={massSelectClassName(isLeftSelected)}
                  onClick={() => selectGroups([LEFT_ZONES, MIDDLE_ZONES])}
                >
                  {massSelectButtonLabels.middle}
                </Button>
                <Button
                  className={massSelectClassName(isRightSelected)}
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
                        allSelectedSigns={value}
                        setSignIds={onChange}
                        route={selectedRouteFilter}
                        routeToRouteIDMap={routeToRouteIDMap}
                      />
                      {hasRailFilter() && (
                        <PlaceZonesRow
                          place={place}
                          allSelectedSigns={value}
                          setSignIds={onChange}
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
  setSignIds,
  route,
  routeToRouteIDMap,
}: {
  place: Place;
  allSelectedSigns: string[];
  setSignIds: (signs: string[]) => void;
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
      setSignIds(fp.without([signID], allSelectedSigns));
    } else {
      setSignIds(fp.uniq([...allSelectedSigns, signID]));
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
      <td className="place-name-cell">
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
          className={
            allSignsSelected ? "button-primary" : "button-primary-outline"
          }
          onClick={() => {
            const signIDsAtPlace = allSignsForRouteAtPlace.map((s) => s.id);
            if (allSignsSelected) {
              setSignIds(fp.without(signIDsAtPlace, allSelectedSigns));
            } else {
              setSignIds(fp.uniq(allSignsForRouteAtPlace.map((s) => s.id)));
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
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              >
                <ArrowLeftShort /> {sign.label ?? getZoneLabel(sign.zone ?? "")}
              </SelectSignButton>
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
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              >
                {sign.label ?? getZoneLabel(sign.zone ?? "")}
              </SelectSignButton>
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
                onClick={() => {
                  onSignButtonClick(sign.id);
                }}
                isSelected={allSelectedSigns.includes(sign.id)}
              >
                {sign.label ?? getZoneLabel(sign.zone ?? "")}{" "}
                <ArrowRightShort />
              </SelectSignButton>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

interface SelectSignButtonProps {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
}

const SelectSignButton = ({
  isSelected,
  onClick,
  children,
}: SelectSignButtonProps) => {
  return (
    <Button
      className={isSelected ? "button-primary" : "button-primary-outline"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default SelectZonesPage;
