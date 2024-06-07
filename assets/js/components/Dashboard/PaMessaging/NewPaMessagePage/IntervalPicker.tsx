import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  interval: number;
  onChangeInterval: (interval: number) => void;
}

const IntervalPicker = ({ interval, onChangeInterval }: Props) => {
  return (
    <Form.Group>
      <Form.Label htmlFor="interval-picker" className="label body--regular">
        Interval (min)
      </Form.Label>
      {/* <Row md="auto" className="align-items-center"> */}
      <Form.Control
        id="interval-picker"
        className="m-0 interval"
        value={interval}
        type="number"
        onChange={(input) => onChangeInterval(Number(input.target.value))}
      />
      {/* </Row> */}
    </Form.Group>
  );
};

export default IntervalPicker;
