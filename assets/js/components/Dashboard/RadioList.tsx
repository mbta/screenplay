import React from "react";
import * as styles from "Styles/radio-list.module.scss";
import { useUniqueId } from "Hooks/useUniqueId";
import cx from "classnames";
import fp from "lodash/fp";

type RadioListProps<T> = {
  items: {
    content: React.ReactNode;
    checkedClass?: string;
    value: T;
  }[];
  value: T;
  onChange: (arg0: T) => void;
  className?: string;
};

export const RadioList = <T,>({
  items,
  value: currentValue,
  onChange,
  className,
}: RadioListProps<T>) => {
  const name = useUniqueId();
  return (
    <div className={cx(className, styles.radioList)} role="radiogroup">
      {items.map(({ value, checkedClass = "", content }, index) => {
        const checked = fp.equals(currentValue, value);
        return (
          <label
            key={index}
            className={cx(styles.radioItem, { [checkedClass]: checked })}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              className={styles.radioItemInput}
              onChange={() => onChange(value)}
            />
            {content}
          </label>
        );
      })}
    </div>
  );
};
