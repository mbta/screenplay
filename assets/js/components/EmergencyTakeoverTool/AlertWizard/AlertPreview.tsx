import React from "react";
import { Message } from "../EmergencyTakeoverTool";
import SVGPreviews from "./SVGPreviews";
import { getMessageImageUrl } from "../../../util";

interface AlertPreviewProps {
  message: Message;
  where: "indoor" | "outdoor";
  empty?: boolean;
}

const AlertPreview = ({ message, where, empty }: AlertPreviewProps) => {
  if (empty) {
    return (
      <img
        className="portrait-png"
        src={`/images/Outfront-Alert-Empty-Preview.png`}
        alt=""
      />
    );
  }
  if (message.type === "canned") {
    return (
      <img
        className="portrait-png"
        src={getMessageImageUrl(message, where, "portrait")}
        alt=""
      />
    );
  }

  return <SVGPreviews showText prefix={where} message={message.text[where]} />;
};

export default AlertPreview;
