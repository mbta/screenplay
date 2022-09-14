import React from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { Check, XCircleFill } from "react-bootstrap-icons";
import classNames from "classnames";
import { defaultButtonColor } from "../../constants/misc";
import { classWithModifier } from "../../util";

interface FilterDropdownItem {
  label: string;
  color?: string;
}

interface FilterDropdownProps {
  list: FilterDropdownItem[];
  onSelect: (eventKey: string | null) => void;
  selectedValue: FilterDropdownItem;
  className: string;
  disabled?: boolean;
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

  const backgroundColor = selectedValue.color
    ? selectedValue.color
    : defaultButtonColor;
  const color = selectedValue.label === "Bus" ? "black" : "white";

  const FilterDropdownButton = (
    <Dropdown.Toggle
      className={classNames(
        "filter-dropdown__dropdown-button d-flex justify-content-between",
        {
          "filter-dropdown__dropdown-button--small": !isDefault(),
          disabled: props.disabled,
        }
      )}
      title={props.disabled ? "Coming Soon!" : selectedValue.label}
      data-testid="filter-dropdown-button"
      style={{
        background: backgroundColor,
        border: backgroundColor,
        color: color,
      }}
    >
      {selectedValue.label}
    </Dropdown.Toggle>
  );

  return (
    <ButtonGroup
      className={classWithModifier(
        "filter-dropdown__button-group",
        props.className
      )}
    >
      {!isDefault() && (
        <Button
          onClick={() => onSelect(list[0].label)}
          data-testid="filter-dropdown-clear-button"
          className="filter-dropdown__clear-button"
          style={{
            background: backgroundColor,
            border: backgroundColor,
          }}
        >
          <XCircleFill size={16} className="m-0" style={{ color: color }} />
        </Button>
      )}
      <Dropdown
        onSelect={onSelect}
        className={classWithModifier(
          "filter-dropdown__dropdown",
          props.className
        )}
      >
        {props.disabled ? (
          <span title="Coming Soon!">{FilterDropdownButton}</span>
        ) : (
          FilterDropdownButton
        )}
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
