import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import classNames from "classnames";

type Filter = {
  label: string;
  value: any;
};

interface Props {
  header: string;
  filters: Filter[];
  selectedFilter: string;
  onFilterSelect: (value: string) => void;
  className?: string;
}

const FilterGroup = ({
  header,
  filters,
  selectedFilter,
  onFilterSelect,
  className,
}: Props) => {
  return (
    <div className={classNames("filter-group", className)}>
      <div className="header">{header}</div>
      <ButtonGroup className="button-group" vertical>
        {filters.map((filter) => {
          return (
            <Button
              key={filter.value}
              className={classNames("filter-button", {
                selected: selectedFilter === filter.value,
              })}
              onClick={() => onFilterSelect(filter.value)}
            >
              {filter.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
};

export default FilterGroup;
