import React from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
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
    <ButtonGroup className="filter-dropdown__button-group">
      {!isDefault() && (
        <Button
          onClick={() => onSelect(list[0].label)}
          data-testid="filter-dropdown-clear-button"
        >
          <XCircleFill size={16} className="m-0" />
        </Button>
      )}
      <Dropdown onSelect={onSelect} as={ButtonGroup}>
        <Dropdown.Toggle
          className="filter-dropdown__dropdown-button"
          title={selectedValue.label}
          size="lg"
          data-testid="filter-dropdown-button"
        >
          {selectedValue.label}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {list.map(({ label }) => {
            return (
              <Dropdown.Item key={label} eventKey={label}>
                {label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
};

export default FilterDropdown;
