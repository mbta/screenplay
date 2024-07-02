import React, { ComponentType } from "react";
import { DirectionID } from "Models/direction_id";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import classNames from "classnames";

interface SortLabelProps {
  label: string;
  sortDirection: DirectionID;
  onClick: any;
  className?: string;
}

const SortLabel: ComponentType<SortLabelProps> = ({
  label,
  sortDirection,
  className,
  onClick,
}: SortLabelProps) => {
  return (
    <div
      className={classNames("sort-label d-flex align-items-center", className)}
      onClick={onClick}
      data-testid="sort-label"
    >
      {label}{" "}
      {sortDirection === 0 ? (
        <ArrowDown className="bootstrap-line-icon" />
      ) : (
        <ArrowUp className="bootstrap-line-icon" />
      )}
    </div>
  );
};

export default SortLabel;
