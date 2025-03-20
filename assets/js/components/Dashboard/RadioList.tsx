import React, { useContext } from "react";
import * as styles from "Styles/radio-list.module.scss";
import { useUniqueId } from "Hooks/useUniqueId";
import cx from "classnames";
import fp from "lodash/fp";

const RadioContext = React.createContext<{
  name: string;
  currentValue: any;
  onChange: (arg0: any) => void;
}>({ name: "", currentValue: null, onChange: (_value) => {} });

type RadioListProps = {
  children: React.ReactNode;
  value: any;
  onChange: (arg0: any) => void;
  className?: string;
};

const RadioList = ({
  children,
  value,
  onChange,
  className,
}: RadioListProps) => {
  const name = useUniqueId();
  return (
    <div className={cx(className, styles.radioList)} role="radiogroup">
      <RadioContext.Provider value={{ name, currentValue: value, onChange }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
};

type RadioItemProps = {
  children: React.ReactNode;
  checkedClass?: string;
  value: any;
};

const RadioItem = ({ children, checkedClass = "", value }: RadioItemProps) => {
  const { name, currentValue, onChange } = useContext(RadioContext);
  const checked = fp.equals(currentValue, value);
  return (
    <label className={cx(styles.radioItem, { [checkedClass]: checked })}>
      <input
        type="radio"
        name={name}
        checked={checked}
        className={styles.radioItemInput}
        onChange={() => onChange(value)}
      />
      {children}
    </label>
  );
};

export { RadioList, RadioItem };
