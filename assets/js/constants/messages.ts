import { BASE_URL } from "./constants";

export interface CannedMessage {
  id: number;
  name: string;
  text: {
    indoor: string;
    outdoor: string;
  };
  images: {
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

let cachedCannedMessages: CannedMessage[] | null = null;

export async function getCannedMessages(): Promise<CannedMessage[]> {
  if (cachedCannedMessages) {
    return cachedCannedMessages;
  }

  const response = await fetch(`${BASE_URL}/canned_messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch canned messages");
  }

  cachedCannedMessages = await response.json();
  return cachedCannedMessages;
}

export default getCannedMessages;

