import React, { ComponentType } from "react";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";
import Calendar from "react-calendar";
import { Value } from "react-calendar/dist/cjs/shared/types";

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: Value) => void;
  minDateString?: string;
  maxDateString?: string;
}

const DatePicker: ComponentType<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDateString,
  maxDateString,
}: DatePickerProps) => {
  const minDate = minDateString ? new Date(minDateString) : new Date(-1);
  const maxDate = maxDateString
    ? new Date(maxDateString)
    : new Date(Number.MAX_SAFE_INTEGER);

  return (
    <OverlayTrigger
      placement="bottom-start"
      rootClose
      trigger="click"
      overlay={
        <Popover className="calendar-popover">
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            defaultValue={new Date(selectedDate)}
            onChange={(date) => {
              onChange(date);
              document.body.click();
            }}
          />
        </Popover>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <Form ref={ref} {...triggerHandler} className="date-picker">
          <Form.Control readOnly value={selectedDate} />
        </Form>
      )}
    </OverlayTrigger>
  );
};

export default DatePicker;
