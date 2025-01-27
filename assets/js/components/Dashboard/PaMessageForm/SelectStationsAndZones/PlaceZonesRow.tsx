import React from "react";
import { Place } from "Models/place";
import { Screen } from "Models/screen";
import { signIDs } from "../../../../util";
import fp from "lodash/fp";
import { Button } from "react-bootstrap";
import SignButtonGroup from "./SignButtonGroup";
import { ArrowLeftShort, ArrowRightShort } from "react-bootstrap-icons";

interface PlaceZonesRow {
  place: Place;
  allSelectedSigns: string[];
  allSignsForRouteAtPlace: Screen[];
  setSignIds: (signIds: string[]) => void;
  leftZones: Screen[];
  middleZones: Screen[];
  rightZones: Screen[];
  route: string;
  branches?: string[];
  disabled?: boolean;
}

const PlaceZonesRow = ({
  place,
  allSelectedSigns,
  allSignsForRouteAtPlace,
  setSignIds,
  leftZones,
  middleZones,
  rightZones,
  route,
  branches = [],
  disabled = false,
}: PlaceZonesRow) => {
  if (allSignsForRouteAtPlace.length === 0) return null;

  const selectedSignsForRouteAtPlace = signIDs(allSignsForRouteAtPlace).filter(
    (id: string) => allSelectedSigns.includes(id),
  );

  const onSignButtonClick = (signID: string) => {
    if (allSelectedSigns.includes(signID)) {
      setSignIds(fp.without([signID], allSelectedSigns));
    } else {
      setSignIds(fp.uniq([...allSelectedSigns, signID]));
    }
  };

  const allSignsSelected =
    selectedSignsForRouteAtPlace.length === allSignsForRouteAtPlace.length;

  return (
    <tr className="table-row">
      <td className="place-name-cell">
        <div className="place-name-container">
          {branches.length > 0 && (
            <div className="route bg-green">{branches.join(" ")}</div>
          )}
          <div className="place-name">{place.name}</div>
          {route === "Bus" && <div className="route bg-bus">Bus</div>}
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
              setSignIds(
                fp.concat(
                  allSignsForRouteAtPlace.map((s) => s.id),
                  allSelectedSigns,
                ),
              );
            }
          }}
          disabled={disabled}
        >
          All
        </Button>
      </td>
      <td className="cell left-cell">
        <SignButtonGroup
          signs={leftZones}
          onSignButtonClick={onSignButtonClick}
          leftIcon={<ArrowLeftShort />}
          allSelectedSigns={allSelectedSigns}
          disabled={disabled}
        />
      </td>
      <td className="cell middle-cell">
        <SignButtonGroup
          signs={middleZones}
          onSignButtonClick={onSignButtonClick}
          allSelectedSigns={allSelectedSigns}
          disabled={disabled}
        />
      </td>
      <td className="cell right-cell">
        <SignButtonGroup
          signs={rightZones}
          onSignButtonClick={onSignButtonClick}
          rightIcon={<ArrowRightShort />}
          allSelectedSigns={allSelectedSigns}
          disabled={disabled}
        />
      </td>
    </tr>
  );
};

export default PlaceZonesRow;
