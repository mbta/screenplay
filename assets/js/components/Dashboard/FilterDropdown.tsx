import React from "react";
import { Button, ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { XCircleFill } from "react-bootstrap-icons";

interface FilterDropdownItem {
  label: string;
}

interface FilterDropdownProps {
  list: FilterDropdownItem[];
  onSelect: (eventKey: string | null) => void;
  selectedValue: FilterDropdownItem;
}

/**
 * Component used to display each place and their screen simulations.
 * Assumes it is displayed in an Accordion component from react-bootstrap.
 */
const FilterDropdown = (props: FilterDropdownProps): JSX.Element => {
  const { list, selectedValue, onSelect } = props;

  const isDefault = () => selectedValue.label === list[0].label;

  return (
    <ButtonGroup>
      {!isDefault() && (
        <Button
          onClick={() => onSelect(list[0].label)}
          data-testid="filter-dropdown-clear-button"
        >
          <XCircleFill size={16} className="m-0" />
        </Button>
      )}
      <DropdownButton
        onSelect={onSelect}
        title={selectedValue.label}
        size="lg"
        style={{ width: "100%" }}
        data-testid="filter-dropdown-button"
      >
        {list.map(({ label }) => {
          return (
            <Dropdown.Item key={label} eventKey={label}>
              {label}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </ButtonGroup>
  );
};

export default FilterDropdown;
