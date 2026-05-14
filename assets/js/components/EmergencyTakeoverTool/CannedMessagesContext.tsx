import React, { ReactNode, useState, useEffect } from "react";
import { getCannedMessages, CannedMessage } from "Utils/emergencyMessages";

interface CannedMessagesContextType {
  messages: CannedMessage[];
  loading: boolean;
}

export const CannedMessagesContext =
  React.createContext<CannedMessagesContextType>({
    messages: [],
    loading: true,
  });

interface CannedMessagesProviderProps {
  children: ReactNode;
}

export const CannedMessagesProvider: React.FC<CannedMessagesProviderProps> = ({
  children,
}) => {
  const [messages, setMessages] = useState<CannedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCannedMessages().then((data) => {
      if (data) {
        setMessages(data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <CannedMessagesContext.Provider value={{ messages, loading }}>
      {children}
    </CannedMessagesContext.Provider>
  );
};
