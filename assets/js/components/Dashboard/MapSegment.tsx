import React, { ComponentType } from "react";
import cx from "classnames";
import { Station } from "Constants/stationOrder";
import * as styles from "Styles/map-segment.module.scss";

interface MapSegmentProps {
  station: Station;
  line: string;
  className?: string;
}

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="-10 -500 44 1000" className={styles.lines}>
    {children}
  </svg>
);

const Circle = ({
  right,
  filled,
  branch,
}: {
  right?: boolean;
  filled?: boolean;
  branch?: string;
}) => (
  <span
    className={cx(styles.circle, {
      [styles.right]: right,
      [styles.filled]: filled,
    })}
  >
    {branch}
  </span>
);

const LineDown = ({ x, y1 }: { x: number; y1: number }) => (
  <line x1={x} y1={y1} x2={x} y2={1000} />
);

const LineUp = ({ x, y1 }: { x: number; y1: number }) => (
  <line x1={x} y1={y1} x2={x} y2={-1000} />
);

const LineThrough = ({ x }: { x: number }) => (
  <line x1={x} y1={-1000} x2={x} y2={1000} />
);

const TrunkTop = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineDown x={0} y1={8} />
    </Svg>
    <Circle branch={branch} />
  </>
);

const TrunkMiddle = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
    </Svg>
    <Circle filled branch={branch} />
  </>
);

const TrunkBottom = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineUp x={0} y1={-8} />
    </Svg>
    <Circle branch={branch} />
  </>
);

const ForkDown = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <path d="M0,0S24,0,24,24" />
      <LineDown x={24} y1={24} />
    </Svg>
    <Circle filled branch={branch} />
  </>
);

const ForkUp = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <path d="M0,0S24,0,24,-24" />
      <LineUp x={24} y1={-24} />
    </Svg>
    <Circle filled branch={branch} />
  </>
);

const BranchTop = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <LineDown x={24} y1={8} />
    </Svg>
    <Circle right branch={branch} />
  </>
);

const BranchMiddle = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <LineThrough x={24} />
    </Svg>
    <Circle filled right branch={branch} />
  </>
);

const BranchBottom = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <LineUp x={24} y1={-8} />
    </Svg>
    <Circle right branch={branch} />
  </>
);

const BranchForkDown = ({ branch }: { branch?: string }) => (
  <>
    <Svg>
      <LineThrough x={0} />
      <path d="M0,-24S24,-24,24,0" />
      <LineDown x={24} y1={8} />
    </Svg>
    <Circle filled right branch={branch} />
  </>
);

const Map: { [key: string]: ComponentType<{ branch?: string }> } = {
  "Trunk-Top": TrunkTop,
  "Trunk-Middle": TrunkMiddle,
  "Trunk-Bottom": TrunkBottom,
  "Fork-Down": ForkDown,
  "Fork-Up": ForkUp,
  "Branch-Top": BranchTop,
  "Branch-Middle": BranchMiddle,
  "Branch-Bottom": BranchBottom,
  "Branch-Fork-Down": BranchForkDown,
};

const MapSegment = ({ station, line, className }: MapSegmentProps) => {
  if (!station.inlineMap) return <></>;

  const Contents = Map[station.inlineMap];
  return (
    <div className={cx(styles.segment, className, line.split("-")[0])}>
      <Contents branch={station.branch} />
    </div>
  );
};

export default MapSegment;
