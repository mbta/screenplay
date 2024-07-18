import moment from "moment";
import React, { useRef, useState } from "react";
import { Button, Form, InputGroup, Overlay, Popover } from "react-bootstrap";
import { CalendarCheck } from "react-bootstrap-icons";
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
      <InputGroup className="date-picker" ref={ref}>
        <Form.Control
          id={id}
          name={`${id}-input`}
          value={selectedDate}
          onChange={(input) => onChange(input.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              setShowOverlay(true);
            }
          }}
        />
        <Button onClick={() => setShowOverlay(true)}>
          <CalendarCheck />
        </Button>
      </InputGroup>
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
              value={
                moment(selectedDate).isValid()
                  ? selectedDate
                  : moment().format("L")
              }
              onChange={(date) => onChange(moment(date as Date).format("L"))}
            />
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default DatePicker;
