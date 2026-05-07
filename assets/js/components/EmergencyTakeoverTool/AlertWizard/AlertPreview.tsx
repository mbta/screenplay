import React from "react";
import { Message } from "../EmergencyTakeoverTool";
import SVGPreviews from "./SVGPreviews";
import { getMessageImageUrl } from "../../../util";

interface AlertPreviewProps {
  message: Message;
  location: "indoor" | "outdoor";
  empty?: boolean;
}

const AlertPreview = ({ message, location, empty }: AlertPreviewProps) => {
  if (empty) {
    return (
      <img
        className="portrait-png"
        src={`/images/alerts/Empty-preview.png`}
        alt=""
      />
    );
  }
  if (message.type === "canned") {
    return (
      <img
        className="portrait-png"
        src={getMessageImageUrl(message, location, "portrait")}
        alt=""
      />
    );
  }

  return (
    <SVGPreviews showText prefix={location} message={message.text[location]} />
  );
};

export default AlertPreview;
