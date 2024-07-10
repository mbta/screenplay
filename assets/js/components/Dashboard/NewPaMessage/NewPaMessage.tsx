import React, { useState } from "react";
import moment from "moment";

import NewPaMessagePage from "./NewPaMessagePage";

const NewPaMessage = () => {
  const now = moment();

  const [startDate, setStartDate] = useState(now.format("L"));
  const [startTime, setStartTime] = useState(now.format("HH:mm"));
  const [endDate, setEndDate] = useState(now.format("L"));
  const [endTime, setEndTime] = useState(now.add(1, "hour").format("HH:mm"));
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [priority, setPriority] = useState(2);
  const [interval, setInterval] = useState("4");
  const [visualText, setVisualText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <NewPaMessagePage
      {...{
        days,
        endDate,
        endTime,
        errorMessage,
        interval,
        phoneticText,
        priority,
        setDays,
        setEndDate,
        setEndTime,
        setErrorMessage,
        setInterval,
        setPhoneticText,
        setPriority,
        setStartDate,
        setStartTime,
        setVisualText,
        startDate,
        startTime,
        visualText,
      }}
    />
  );
};

export default NewPaMessage;
