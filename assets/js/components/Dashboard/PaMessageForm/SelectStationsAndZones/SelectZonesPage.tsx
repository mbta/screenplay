import React, { Fragment, useMemo, useState } from "react";
import { Page } from "../types";
import { Button } from "react-bootstrap";
import { Place } from "Models/place";
import fp from "lodash/fp";
import {
  getPlacesFromFilter,
  getRouteIdsForSign,
  signIDs,
  signsByDirection,
  sortByStationOrder,
  sortRoutes,
} from "../../../../util";
import cx from "classnames";
import { Dot } from "react-bootstrap-icons";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import PlaceZonesRow from "./PlaceZonesRow";
import { RadioList } from "Components/RadioList";
import * as styles from "Styles/pa-messages.module.scss";

const ROUTE_TO_CLASS_NAMES_MAP: { [key: string]: string } = {
  Green: "bg-mbta-green",
  Red: "bg-mbta-red",
  Orange: "bg-mbta-orange",
  Blue: "bg-mbta-blue",
  Mattapan: "bg-mbta-red",
  Silver: "bg-mbta-silver",
  Bus: "bg-mbta-bus text-invert",
};

interface Props {
  value: string[];
  onChange: (signIds: string[]) => void;
  onSubmit: (signIds: string[]) => void;
  navigateTo: (page: Page) => void;
  places: Place[];
  isReadOnly?: boolean;
}

const SelectZonesPage = ({
  value,
  onChange,
  onSubmit,
  navigateTo,
  places,
  isReadOnly = false,
}: Props) => {
  const routeToRouteIDMap = useRouteToRouteIDsMap();
  const getInitialPlacesWithSelectedSigns = () =>
    places.filter((p) => p.screens.some((s) => value.includes(s.id)));

  const [initialPlacesWithSelectedSigns] = useState<Place[]>(
    getInitialPlacesWithSelectedSigns,
  );

  const isSelected = (id: string) => value.includes(id);

  const getRouteFilterGroups = () => {
    return fp.flow(
      fp.flatMap((place: Place) =>
        place.screens
          .filter((s) => isSelected(s.id))
          .flatMap(getRouteIdsForSign),
      ),
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
    )(initialPlacesWithSelectedSigns);
  };

  const routeFilterGroups = getRouteFilterGroups();
  const routeFilterIds = sortRoutes(Object.keys(routeFilterGroups));

  const [selectedRouteFilter, setSelectedRouteFilter] = useState(
    routeFilterIds[0],
  );

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
  }, [selectedRouteFilter, directionLabels.left, directionLabels.right]);

  const filteredPlaces = useMemo(() => {
    return getPlacesFromFilter(initialPlacesWithSelectedSigns, (r) =>
      routeToRouteIDMap[selectedRouteFilter]?.some((a) => r === a),
    );
  }, [selectedRouteFilter, routeToRouteIDMap, initialPlacesWithSelectedSigns]);

  const allScreens = filteredPlaces.flatMap((p) => {
    return p.screens.filter(
      (s) =>
        fp.intersection(
          routeToRouteIDMap[selectedRouteFilter],
          getRouteIdsForSign(s),
        ).length > 0,
    );
  });

  const isDirectionGroupSelected = (directionId: 0 | 1) =>
    signIDs(
      allScreens.filter((s) =>
        s.routes?.map((r) => r.direction_id).includes(directionId),
      ),
    ).every(isSelected);

  const selectDirectionGroup = (directionId: 0 | 1) => {
    const signsWithoutSelectedRoute = fp.without(signIDs(allScreens), value);

    const newScreens = allScreens.filter((s) =>
      s.routes?.map((r) => r.direction_id).includes(directionId),
    );

    onChange(fp.uniq([...signsWithoutSelectedRoute, ...signIDs(newScreens)]));
  };

  const isAllSelected =
    value.length > 0 && signIDs(allScreens).every(isSelected);
  const isLeftSelected = !isAllSelected && isDirectionGroupSelected(0);
  const isRightSelected = !isAllSelected && isDirectionGroupSelected(1);

  const filterPillLabel = useMemo(() => {
    return selectedRouteFilter.startsWith("Green-")
      ? `Green Line ${selectedRouteFilter.split("-")[1]}`
      : selectedRouteFilter === "Bus"
        ? "Bus"
        : `${selectedRouteFilter} Line`;
  }, [selectedRouteFilter]);

  const getSignsFromPlaceForRouteId = (place: Place, routeId: string) => {
    return place.screens.filter((screen) =>
      getRouteIdsForSign(screen).some((id) =>
        routeToRouteIDMap[routeId].includes(id),
      ),
    );
  };

  return (
    <div className="select-zones-page">
      <div className="d-flex align-items-center">
        <h1 className="mb-0">Review Zones</h1>
        <Button
          className={cx(styles.editStationsButton, "ms-3 me-auto")}
          onClick={() => navigateTo(Page.STATIONS)}
        >
          {isReadOnly ? "Return to Select" : "Edit"} Stations
        </Button>
        {!isReadOnly && (
          <Button
            variant="link"
            className={cx(styles.transparentButton, "me-3")}
            onClick={() => navigateTo(Page.MAIN)}
          >
            Cancel
          </Button>
        )}
        <Button
          className="button-primary"
          onClick={() => {
            onSubmit(value);
            navigateTo(Page.MAIN);
          }}
        >
          Done
        </Button>
      </div>
      <div className="zone-selection">
        <div className="filters-container">
          <div className="fs-5">Service type</div>
          <RadioList
            value={selectedRouteFilter}
            onChange={setSelectedRouteFilter}
            items={routeFilterIds.flatMap((routeId) => [
              {
                value: routeId,
                content: routeId,
                checkedClass: ROUTE_TO_CLASS_NAMES_MAP[routeId],
              },
              ...(routeId === "Green"
                ? routeFilterGroups["Green"].sort().map((branchId) => ({
                    value: branchId,
                    content: (
                      <>
                        <Dot /> {branchId.split("-")[1]} Branch
                      </>
                    ),
                    checkedClass: ROUTE_TO_CLASS_NAMES_MAP[routeId],
                  }))
                : []),
            ])}
          >
            {}
          </RadioList>
        </div>
        <div className="zones-table-container">
          <div className="container-header">
            <div className="title-and-route-container">
              <div className="title h3">Zones</div>
              <div
                className={cx(
                  "route fs-5",
                  ROUTE_TO_CLASS_NAMES_MAP[selectedRouteFilter.split("-")[0]],
                )}
              >
                {filterPillLabel}
              </div>
            </div>
            {selectedRouteFilter !== "Bus" && (
              <div className="mass-select-button-container">
                <Button
                  className={cx("button-secondary-outline", {
                    "button-active": isAllSelected,
                  })}
                  onClick={() =>
                    onChange(fp.uniq([...value, ...signIDs(allScreens)]))
                  }
                  disabled={isReadOnly}
                >
                  {massSelectButtonLabels.left}
                </Button>
                <Button
                  className={cx("button-secondary-outline", {
                    "button-active": isLeftSelected,
                  })}
                  onClick={() => selectDirectionGroup(0)}
                  disabled={isReadOnly}
                >
                  {massSelectButtonLabels.middle}
                </Button>
                <Button
                  className={cx("button-secondary-outline", {
                    "button-active": isRightSelected,
                  })}
                  onClick={() => selectDirectionGroup(1)}
                  disabled={isReadOnly}
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
                  const allSignsForRouteFilterAtPlace =
                    getSignsFromPlaceForRouteId(place, selectedRouteFilter);
                  const allBusSignsForRouteAtPlace =
                    getSignsFromPlaceForRouteId(place, "Bus");

                  const signsGroupedByZone = signsByDirection(
                    allSignsForRouteFilterAtPlace,
                  );
                  const busSignsGroupedByZone =
                    selectedRouteFilter === "Bus"
                      ? signsGroupedByZone
                      : signsByDirection(allBusSignsForRouteAtPlace);

                  const branches =
                    selectedRouteFilter === "Green"
                      ? fp
                          .uniq(
                            allSignsForRouteFilterAtPlace.flatMap((s) =>
                              fp.map(
                                (r) => r.split("-")[1],
                                getRouteIdsForSign(s),
                              ),
                            ),
                          )
                          .sort()
                      : [];

                  return (
                    <Fragment key={`place-zones-row-${place.id}`}>
                      <PlaceZonesRow
                        place={place}
                        allSelectedSigns={value}
                        allSignsForRouteAtPlace={allSignsForRouteFilterAtPlace}
                        setSignIds={onChange}
                        leftZones={signsGroupedByZone.left}
                        middleZones={signsGroupedByZone.middle}
                        rightZones={signsGroupedByZone.right}
                        route={selectedRouteFilter}
                        branches={branches}
                        disabled={isReadOnly}
                      />
                      {selectedRouteFilter !== "Bus" && (
                        <PlaceZonesRow
                          place={place}
                          allSelectedSigns={value}
                          allSignsForRouteAtPlace={allBusSignsForRouteAtPlace}
                          setSignIds={onChange}
                          leftZones={busSignsGroupedByZone.left}
                          middleZones={busSignsGroupedByZone.middle}
                          rightZones={busSignsGroupedByZone.right}
                          route={"Bus"}
                          disabled={isReadOnly}
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

export default SelectZonesPage;
