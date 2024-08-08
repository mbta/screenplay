import React, { ReactElement } from "react";
import { Screen } from "Models/screen";
import { getZoneLabel } from "../../../../util";
import { Button } from "react-bootstrap";
import cx from "classnames";

type SelectSignButtonProps = React.PropsWithChildren<{
  isSelected: boolean;
  onClick: () => void;
}>;

const SelectSignButton = ({
  isSelected,
  onClick,
  children,
}: SelectSignButtonProps) => {
  return (
    <Button
      className={cx("button-primary-outline", { "button-active": isSelected })}
      onClick={onClick}
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
}

const SignButtonGroup = ({
  signs,
  onSignButtonClick,
  leftIcon,
  rightIcon,
  allSelectedSigns,
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
          >
            {leftIcon} {sign.label ?? getZoneLabel(sign.zone ?? "")} {rightIcon}
          </SelectSignButton>
        );
      })}
    </div>
  );
};

export default SignButtonGroup;
