import React, { ReactNode, useState, useEffect } from "react";
import getCannedMessages, { type CannedMessage } from "Constants/messages";

interface CannedMessagesContextType {
  messages: CannedMessage[];
  loading: boolean;
  error: Error | null;
}

export const CannedMessagesContext = React.createContext<CannedMessagesContextType>({
  messages: [],
  loading: true,
  error: null,
});

interface CannedMessagesProviderProps {
  children: ReactNode;
}

export const CannedMessagesProvider: React.FC<CannedMessagesProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<CannedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getCannedMessages()
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <CannedMessagesContext.Provider value={{ messages, loading, error }}>
      {children}
    </CannedMessagesContext.Provider>
  );
};
