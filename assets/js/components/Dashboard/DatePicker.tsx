import moment from "moment";
import React, { useRef, useState } from "react";
import { Form, Overlay, Popover } from "react-bootstrap";
import Calendar from "react-calendar";

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  minDateString?: string;
  maxDateString?: string;
}

const DatePicker = ({
  selectedDate,
  onChange,
  minDateString,
  maxDateString,
}: DatePickerProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef(null);
  const minDate = minDateString ? new Date(minDateString) : undefined;
  const maxDate = maxDateString ? new Date(maxDateString) : undefined;

  return (
    <>
      <Form
        ref={ref}
        className="date-picker"
        onSubmit={(event) => {
          event.preventDefault();
          setShowOverlay(false);
        }}
        onClick={() => setShowOverlay(!showOverlay)}
      >
        <Form.Control
          value={selectedDate}
          onChange={(input) => {
            const inputValue = input.target.value;
            onChange(inputValue);
          }}
        />
      </Form>
      <Overlay
        rootClose
        onHide={() => setShowOverlay(false)}
        target={ref.current}
        placement="bottom-start"
        show={showOverlay}
      >
        {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
        }) => (
          <Popover className="calendar-popover" {...props}>
            <Calendar
              minDate={minDate}
              maxDate={maxDate}
              defaultValue={new Date(selectedDate)}
              onChange={(date) => {
                const newDate = moment(date as Date).format("L");
                onChange(newDate);
              }}
            />
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default DatePicker;
