import React from "react";
import { Button, ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";

interface FilterDropdownProps {
  list: string[];
  onSelect: (eventKey: string | null) => void;
  selectedValue: string;
}

/**
 * Component used to display each place and their screen simulations.
 * Assumes it is displayed in an Accordion component from react-bootstrap.
 */
const FilterDropdown = (props: FilterDropdownProps): JSX.Element => {
  const { list, selectedValue, onSelect } = props;

  const isDefault = () => selectedValue === list[0];

  return (
    <ButtonGroup>
      {!isDefault() && <Button onClick={() => onSelect(list[0])}>X</Button>}
      <DropdownButton
        onSelect={onSelect}
        title={selectedValue}
        size="lg"
        style={{ width: "100%" }}
      >
        {list.map((item) => {
          return (
            <Dropdown.Item key={item} eventKey={item}>
              {item}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </ButtonGroup>
  );
};

export default FilterDropdown;
