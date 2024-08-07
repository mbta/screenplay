import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  interval: string;
  onChangeInterval: (interval: string) => void;
}

const IntervalPicker = ({ interval, onChangeInterval }: Props) => {
  return (
    <Form.Group>
      <Form.Label htmlFor="interval-picker" className="label body--regular">
        Interval (min)
      </Form.Label>
      <Form.Control
        id="interval-picker"
        className="m-0 interval"
        type="number"
        value={interval}
        onChange={(input) => onChangeInterval(input.target.value)}
        required
      />
      <Form.Control.Feedback type="invalid">
        Interval value is required
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default IntervalPicker;
