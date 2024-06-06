import React, { useEffect, useRef, useState } from "react";
import { Card, Form, Overlay, Popover } from "react-bootstrap";
import _ from "lodash";
import fp from "lodash/fp";
import moment from "moment";
import cx from "classnames";

interface TimePickerProps {
  selectedTime: string;
  onChange: (time: string) => void;
}

const TimePicker = ({ selectedTime, onChange }: TimePickerProps) => {
  const timeMoment = moment(selectedTime, "h:mm A");
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedHour, setSelectedHour] = useState(timeMoment.format("hh"));
  const [selectedMinute, setSelectedMinute] = useState(timeMoment.format("mm"));
  const [selectedAmPm, setSelectedAmPm] = useState(timeMoment.format("A"));
  const ref = useRef(null);

  const formatState = () =>
    moment(
      `${selectedHour}:${selectedMinute} ${selectedAmPm}`,
      "hh:mm A",
    ).format("HH:mm");

  useEffect(() => {
    onChange(formatState());
  }, [selectedHour, selectedMinute, selectedAmPm]);

  return (
    <>
      <Form ref={ref} onClick={() => setShowOverlay(true)}>
        <Form.Control
          type="time"
          value={selectedTime}
          onChange={(input) => {
            const inputValue = moment(input.target.value, "HH:mm");
            onChange(inputValue.format("HH:mm"));
            setSelectedHour(inputValue.format("hh"));
            setSelectedMinute(inputValue.format("mm"));
            setSelectedAmPm(inputValue.format("A"));
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
          <Popover className="time-popover" {...props}>
            <Card className="time-picker-card">
              <div className="time-picker-card-columns">
                <div className="hour-col">
                  {fp.range(0, 13).map((hour) => {
                    const hourValue = hour.toString().padStart(2, "0");
                    return (
                      <button
                        type="button"
                        key={`hour-${hour}`}
                        onClick={() => setSelectedHour(hourValue)}
                        className={cx({ selected: selectedHour === hourValue })}
                      >
                        {hourValue}
                      </button>
                    );
                  })}
                </div>
                <div className="minute-col">
                  {_.range(0, 60).map((minute) => {
                    const minuteValue = minute.toString().padStart(2, "0");
                    return (
                      <button
                        type="button"
                        key={`minute-${minute}`}
                        onClick={() => setSelectedMinute(minuteValue)}
                        className={cx({
                          selected: selectedMinute === minuteValue,
                        })}
                      >
                        {minuteValue}
                      </button>
                    );
                  })}
                </div>
                <div className="ampm-col">
                  {["AM", "PM"].map((value) => {
                    return (
                      <button
                        type="button"
                        key={value}
                        className={cx({ selected: selectedAmPm === value })}
                        onClick={() => setSelectedAmPm(value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bottom-buttons">
                <div className="service-time-col">
                  <button
                    type="button"
                    className="start-of-service-button"
                    onClick={() => {
                      onChange("03:00");
                      setSelectedHour("03");
                      setSelectedMinute("00");
                      setSelectedAmPm("AM");
                    }}
                  >
                    Start of Service
                  </button>
                  <button
                    type="button"
                    className="end-of-service-button"
                    onClick={() => {
                      onChange("02:59");
                      setSelectedHour("02");
                      setSelectedMinute("59");
                      setSelectedAmPm("AM");
                    }}
                  >
                    End of Service
                  </button>
                </div>
                <div>
                  <button
                    className="ok-button"
                    type="button"
                    onClick={() => {
                      onChange(formatState());
                      setShowOverlay(false);
                    }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Card>
          </Popover>
        )}
      </Overlay>
    </>
  );
};

export default TimePicker;
