import { withErrorHandling } from "./errorHandler";
import { BASE_URL } from "../constants/constants";

export interface CannedMessage {
  id: number;
  type: "canned";
  name?: string;
  text?: {
    indoor: string;
    outdoor: string;
  };
  images?: {
    indoor: {
      portrait: string;
      landscape: string;
    };
    outdoor: {
      portrait: string;
      landscape: string;
    };
  };
}

export interface CustomMessage {
  type: "custom";
  text: {
    indoor: string;
    outdoor: string;
  };
}

export type Message = CannedMessage | CustomMessage;

// Fetches full canned message details from our API
export const getCannedMessages = withErrorHandling<[], CannedMessage[]>(
  async () => {
    const response = await fetch(`${BASE_URL}/canned_messages`);
    if (!response.ok) {
      throw response;
    }
    return response.json();
  },
  {
    customMessage: "Failed to fetch canned messages.",
  },
);

export const messageDetails = (
  message: Message,
  cannedMessages: CannedMessage[],
): Message => {
  if (message.type === "custom") {
    return message;
  }

  // We only store canned alert history by their IDs, so we need to add on full message details
  const cannedMessage = cannedMessages.find((m) => m.id === message.id);
  if (!cannedMessage) {
    console.error(`Canned message with id ${message.id} not found`);
    return message;
  }
  return cannedMessage;
};

export const getMessageImageUrl = (
  message: CannedMessage,
  location: "indoor" | "outdoor",
  orientation: "portrait" | "landscape",
) => {
  if (!message.images) {
    console.error(`Canned message ${message.id} is missing images data`);
    return "";
  }
  return "/images/alerts/" + message.images[location][orientation];
};

export const getMessageString = (
  message: Message,
  location: "indoor" | "outdoor",
) => {
  if (message.type === "canned") {
    if (message.id === -1 || !message.text) {
      return "";
    }
    return message.text[location];
  }
  return message.text[location];
};
