import React from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { Check, XCircleFill } from "react-bootstrap-icons";
import classNames from "classnames";

interface FilterDropdownItem {
  label: string;
}

interface FilterDropdownProps {
  list: FilterDropdownItem[];
  onSelect: (eventKey: string | null) => void;
  selectedValue: FilterDropdownItem;
}

interface CustomMenuProps {
  children?: React.ReactNode;
  style: any;
  className: any;
  "aria-labelledby": any;
}

const CustomMenu = React.forwardRef<HTMLElement, CustomMenuProps>(
  ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    return (
      <div
        ref={ref as any}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <ul>{children}</ul>
      </div>
    );
  }
);

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
          className="filter-dropdown__clear-button"
        >
          <XCircleFill size={16} className="m-0" />
        </Button>
      )}
      <Dropdown onSelect={onSelect} as={ButtonGroup}>
        <Dropdown.Toggle
          className={classNames(
            "filter-dropdown__dropdown-button d-flex justify-content-between",
            {
              "filter-dropdown__dropdown-button--small": !isDefault(),
            }
          )}
          title={selectedValue.label}
          data-testid="filter-dropdown-button"
        >
          {selectedValue.label}
        </Dropdown.Toggle>
        <Dropdown.Menu
          as={CustomMenu}
          className="filter-dropdown__dropdown-menu"
        >
          {list.map(({ label }) => {
            return (
              <Dropdown.Item
                key={label}
                eventKey={label}
                active={label === selectedValue.label}
                className="filter-dropdown__dropdown-item d-flex justify-content-between align-items-center"
              >
                {label}
                {selectedValue.label === label && <Check />}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  );
};

export default FilterDropdown;
