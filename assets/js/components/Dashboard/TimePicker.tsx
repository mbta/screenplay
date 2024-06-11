import React, { useRef, useState } from "react";
import { Card, Form, Overlay, Popover } from "react-bootstrap";
import fp from "lodash/fp";
import moment from "moment";
import cx from "classnames";

interface TimePickerProps {
  selectedTime: string;
  onChange: (time: string) => void;
  id?: string;
}

const TimePicker = ({ selectedTime, onChange, id }: TimePickerProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef(null);

  const selectedMoment = moment(selectedTime, "h:mm A");

  return (
    <>
      <Form.Control
        id={id}
        ref={ref}
        type="time"
        value={selectedTime}
        onChange={(input) =>
          onChange(moment(input.target.value, "HH:mm").format("HH:mm"))
        }
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
          <Popover className="time-popover" {...props} id={`${id}-overlay`}>
            <Card className="time-picker-card">
              <div className="time-picker-card-columns">
                <div className="hour-col">
                  {fp.range(0, 13).map((hour) => {
                    const hourValue = hour.toString().padStart(2, "0");
                    return (
                      <button
                        type="button"
                        key={`hour-${hour}`}
                        onClick={() =>
                          onChange(
                            selectedMoment.set("hour", hour).format("HH:mm"),
                          )
                        }
                        className={cx({
                          selected: selectedMoment.format("hh") === hourValue,
                        })}
                      >
                        {hourValue}
                      </button>
                    );
                  })}
                </div>
                <div className="minute-col">
                  {fp.range(0, 60).map((minute) => {
                    const minuteValue = minute.toString().padStart(2, "0");
                    return (
                      <button
                        type="button"
                        key={`minute-${minute}`}
                        onClick={() =>
                          onChange(
                            selectedMoment
                              .set("minute", minute)
                              .format("HH:mm"),
                          )
                        }
                        className={cx({
                          selected: selectedMoment.format("mm") === minuteValue,
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
                        className={cx({
                          selected: selectedMoment.format("A") === value,
                        })}
                        onClick={() =>
                          onChange(
                            moment(
                              `${selectedMoment.format("h:mm")} ${value}`,
                              "h:mm A",
                            ).format("HH:mm"),
                          )
                        }
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
                    }}
                  >
                    Start of Service
                  </button>
                  <button
                    type="button"
                    className="end-of-service-button"
                    onClick={() => {
                      onChange("02:59");
                    }}
                  >
                    End of Service
                  </button>
                </div>
                <div>
                  <button
                    className="ok-button"
                    type="button"
                    onClick={() => setShowOverlay(false)}
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
