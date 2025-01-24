import React from "react";
import { Form } from "react-bootstrap";
import cx from "classnames";
import * as paMessageStyles from "Styles/pa-messages.module.scss";

interface Props {
  interval: string;
  onChangeInterval: (interval: string) => void;
  validated: boolean;
  disabled?: boolean;
}

const IntervalPicker = ({
  interval,
  onChangeInterval,
  validated,
  disabled = false,
}: Props) => {
  return (
    <Form.Group>
      <Form.Label
        htmlFor="interval-picker"
        className={paMessageStyles.formLabel}
      >
        Interval (min)
      </Form.Label>
      <Form.Control
        id="interval-picker"
        className={cx(
          paMessageStyles.intervalInput,
          paMessageStyles.inputField,
        )}
        type="number"
        value={interval}
        min={1}
        onChange={(input) => onChangeInterval(input.target.value)}
        required
        isInvalid={validated && (!Number.isInteger(+interval) || +interval < 1)}
        disabled={disabled}
      />
      <Form.Control.Feedback type="invalid">
        Interval value must be a positive integer
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default IntervalPicker;
