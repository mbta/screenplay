import React, { ComponentType } from "react";
import { Station } from "../../constants/stationOrder";
import { classWithModifier } from "../../util";
import TrunkTop from "./bundled_svg/TrunkTop";
import TrunkMiddle from "./bundled_svg/TrunkMiddle";
import TrunkBottom from "./bundled_svg/TrunkBottom";
import ForkDown from "./bundled_svg/ForkDown";
import BranchMiddle from "./bundled_svg/BranchMiddle";
import BranchBottom from "./bundled_svg/BranchBottom";
import BranchForkUp from "./bundled_svg/BranchForkUp";
import BranchForkDown from "./bundled_svg/BranchForkDown";

interface MapSegmentProps {
  station: Station;
  line: string;
}

interface SvgProps {
  className?: string;
  colorHex: string;
  branch?: string;
}

interface SvgToComponentMap {
  [key: string]: ComponentType<SvgProps>;
}

const Map: SvgToComponentMap = {
  "Trunk-Top": TrunkTop,
  "Trunk-Middle": TrunkMiddle,
  "Trunk-Bottom": TrunkBottom,
  "Fork-Down": ForkDown,
  "Branch-Middle": BranchMiddle,
  "Branch-Bottom": BranchBottom,
  "Branch-Fork-Up": BranchForkUp,
  "Branch-Fork-Down": BranchForkDown,
};

const getSegmentColorHex = (line: string) => {
  switch (line) {
    case "red":
    case "mattapan":
      return "#DA291C";
    case "orange":
      return "#ED8B00";
    case "blue":
      return "#004BCC";
    case "silver":
      return "#7C878E";
    case "green":
    case "green-b":
    case "green-c":
    case "green-d":
    case "green-e":
      return "#00843D";
    default:
      return "#FFFFFF";
  }
};

const MapSegment = ({ station, line }: MapSegmentProps): JSX.Element => {
  if (!station.inlineMap) return <></>;

  const Segment = Map[station.inlineMap];
  return (
    <Segment
      className={classWithModifier("map-segment", line)}
      colorHex={getSegmentColorHex(line)}
      branch={station.branch}
    />
  );
};

export default MapSegment;
