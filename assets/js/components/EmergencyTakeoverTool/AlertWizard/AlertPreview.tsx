import React from "react";
import SVGPreviews from "./SVGPreviews";
import { getMessageImageUrl, Message } from "Utils/emergencyMessages";

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
    const imageUrl = getMessageImageUrl(message, "indoor", "portrait");
    return <img className="portrait-png" src={imageUrl} alt="" />;
  }

  return (
    <SVGPreviews
      showText
      prefix={location}
      message={message.text?.[location] || ""}
    />
  );
};

export default AlertPreview;
