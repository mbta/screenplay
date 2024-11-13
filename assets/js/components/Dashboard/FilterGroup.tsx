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
}

const FilterGroup = ({
  header,
  filters,
  selectedFilter,
  onFilterSelect,
}: Props) => {
  return (
    <div className="filter-group">
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
