import React, { useContext } from "react";
import { Message } from "../EmergencyTakeoverTool";
import SVGPreviews from "./SVGPreviews";
import { CannedMessagesContext } from "../CannedMessagesContext";

interface AlertPreviewProps {
  message: Message;
  where: "indoor" | "outdoor";
  empty?: boolean;
}

const AlertPreview = ({ message, where, empty }: AlertPreviewProps) => {
  const { messages: cannedMessages } = useContext(CannedMessagesContext);

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
    // Use images from message if available, otherwise look up from context
    let imageUrl: string | undefined;
    if (message.images) {
      imageUrl = message.images[where].portrait;
    } else {
      const cannedMessage = cannedMessages.find((m) => m.id === message.id);
      imageUrl = cannedMessage?.images?.[where]?.portrait;
    }
    
    if (imageUrl) {
      return (
        <img
          className="portrait-png"
          src={`/images/alerts/${imageUrl}`}
          alt=""
        />
      );
    }
  }

  return <SVGPreviews showText prefix={where} message={message.text?.[where] || ""} />;
};

export default AlertPreview;
