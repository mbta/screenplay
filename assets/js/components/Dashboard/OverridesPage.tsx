import React, { ComponentType } from "react";
import classNames from "classnames";

interface Props {
  isVisible: boolean;
}

const OverridesPage: ComponentType<Props> = (props: Props) => {
  return (
    <div
      className={classNames("overrides-page", {
        "overrides-page--hidden": !props.isVisible,
      })}
    >
      <div className="page-content__header">Overrides</div>
      <div className="page-content__body">{null}</div>
    </div>
  );
};

export default OverridesPage;
