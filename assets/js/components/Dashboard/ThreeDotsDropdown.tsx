import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Button, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ThreeDotsVertical } from "react-bootstrap-icons";

interface CustomToggleProps extends PropsWithChildren {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
  tooltipText?: string;
}

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the dropdown menu
const CustomToggle = React.forwardRef(
  (props: CustomToggleProps, ref: React.Ref<HTMLButtonElement>) => (
    <OverlayTrigger
      key="bottom"
      placement="bottom"
      overlay={
        props.tooltipText ? <Tooltip>{props.tooltipText}</Tooltip> : <></>
      }
    >
      <Button
        className="three-dots-vertical-button"
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          props.onClick(e);
        }}
      >
        <ThreeDotsVertical className="three-dots-vertical-button__icon" />
        {props.children}
      </Button>
    </OverlayTrigger>
  ),
);

// Expects children to be a group of `Dropdown.Item`s
interface Props extends PropsWithChildren {
  tooltipText?: string;
}

const ThreeDotsDropdown = ({ children, tooltipText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For handling clicking outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Dropdown
      className="three-dots-vertical-dropdown"
      show={isOpen}
      ref={dropdownRef}
      drop={"down"}
    >
      <Dropdown.Toggle
        as={CustomToggle}
        onClick={() => setIsOpen(!isOpen)}
        tooltipText={tooltipText}
      />
      <Dropdown.Menu className="three-dots-vertical-dropdown__menu">
        {children}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThreeDotsDropdown;
