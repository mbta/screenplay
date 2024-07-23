import moment from "moment";
import React, { useRef, useState } from "react";
import { Button, Form, InputGroup, Overlay, Popover } from "react-bootstrap";
import { CalendarCheck } from "react-bootstrap-icons";
import Calendar from "react-calendar";

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  id?: string;
}

const DatePicker = ({ selectedDate, onChange, id }: DatePickerProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef(null);

  return (
    <>
      <InputGroup className="date-picker picker" ref={ref}>
        <Form.Control
          id={id}
          name={`${id}-input`}
          value={selectedDate}
          onChange={(event) => onChange(event.target.value)}
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
