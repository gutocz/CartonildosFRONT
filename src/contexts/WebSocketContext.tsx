import React, { createContext, type ReactNode, useEffect, useState, useCallback } from 'react';
import type { WebSocketMessage } from '../types';

interface WebSocketContextType {
  messages: WebSocketMessage[];
  sendMessage: (type: string, payload: any) => void;
  isConnected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Conectado ao servidor WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    ws.onclose = () => {
      console.log('Desconectado do servidor WebSocket');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.error("WebSocket não está aberto. Estado: " + (socket ? socket.readyState : 'socket nulo'));
    }
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};