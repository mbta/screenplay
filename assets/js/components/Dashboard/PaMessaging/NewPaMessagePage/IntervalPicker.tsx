import React from "react";
import { Row, Form } from "react-bootstrap";

interface Props {
  interval: number;
  onChangeInterval: (interval: number) => void;
}

const IntervalPicker = ({ interval, onChangeInterval }: Props) => {
  return (
    <>
      <div className="label body--regular">Interval (min)</div>
      <Row md="auto" className="align-items-center">
        <Form className="m-0 interval">
          <Form.Control
            value={interval}
            type="number"
            onChange={(input) => onChangeInterval(Number(input.target.value))}
          />
        </Form>
      </Row>
    </>
  );
};

export default IntervalPicker;
