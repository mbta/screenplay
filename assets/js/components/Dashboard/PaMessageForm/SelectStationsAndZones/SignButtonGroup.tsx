import React, { ReactElement } from "react";
import { Screen } from "Models/screen";
import { getZoneLabel } from "../../../../util";
import { Button } from "react-bootstrap";
import cx from "classnames";

type SelectSignButtonProps = React.PropsWithChildren<{
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}>;

const SelectSignButton = ({
  isSelected,
  onClick,
  children,
  disabled = false,
}: SelectSignButtonProps) => {
  return (
    <Button
      className={cx("button-primary-outline", { "button-active": isSelected })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

interface SignButtonGroupProps {
  signs: Screen[];
  onSignButtonClick: (id: string) => void;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  allSelectedSigns: string[];
  disabled?: boolean;
}

const SignButtonGroup = ({
  signs,
  onSignButtonClick,
  leftIcon,
  rightIcon,
  allSelectedSigns,
  disabled = false,
}: SignButtonGroupProps) => {
  return (
    <div className="sign-button-group">
      {signs.map((sign) => {
        return (
          <SelectSignButton
            key={sign.id}
            onClick={() => {
              onSignButtonClick(sign.id);
            }}
            isSelected={allSelectedSigns.includes(sign.id)}
            disabled={disabled}
          >
            {leftIcon} {sign.label ?? getZoneLabel(sign.zone ?? "")} {rightIcon}
          </SelectSignButton>
        );
      })}
    </div>
  );
};

export default SignButtonGroup;
