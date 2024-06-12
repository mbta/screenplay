import moment from "moment";
import React, { useRef, useState } from "react";
import { Form, Overlay, Popover } from "react-bootstrap";
import Calendar from "react-calendar";

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  minDateString?: string;
  maxDateString?: string;
  id?: string;
}

const DatePicker = ({
  selectedDate,
  onChange,
  minDateString,
  maxDateString,
  id,
}: DatePickerProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef(null);
  const minDate = minDateString ? new Date(minDateString) : undefined;
  const maxDate = maxDateString ? new Date(maxDateString) : undefined;

  return (
    <>
      <Form.Control
        id={id}
        ref={ref}
        className="date-picker"
        name={`${id}-input`}
        value={selectedDate}
        onChange={(input) => onChange(input.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            setShowOverlay(true);
          }
        }}
      />
      <Overlay
        rootClose
        rootCloseEvent="mousedown"
        onHide={() => setShowOverlay(false)}
        target={ref.current}
        placement="bottom-start"
        show={showOverlay}
      >
        {(props) => (
          <Popover className="calendar-popover" {...props} id={`${id}-overlay`}>
            <Calendar
              minDate={minDate}
              maxDate={maxDate}
              defaultValue={new Date(selectedDate)}
              onChange={(date) => onChange(moment(date as Date).format("L"))}
            />
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default DatePicker;
