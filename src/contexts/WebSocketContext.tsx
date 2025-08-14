import React, { createContext, type ReactNode, useEffect, useState, useCallback } from 'react';
import type { WebSocketMessage, User, UserList } from '../types';

interface WebSocketContextType {
  messages: WebSocketMessage[];
  sendMessage: (type: string, payload: any) => void;
  isConnected: boolean;
  user: User | null;
  userList: UserList;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userList, setUserList] = useState<UserList>([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Conectado ao servidor WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const receivedMessage: WebSocketMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);

      if (receivedMessage.type === 'sucessJoinRoom') {
        setUser(receivedMessage.payload.user);
        setUserList(receivedMessage.payload.userList);
      }

      if (receivedMessage.type === 'userListUpdate') {
        setUserList(receivedMessage.payload);
      }
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
    <WebSocketContext.Provider value={{ messages, sendMessage, isConnected, user, userList }}>
      {children}
    </WebSocketContext.Provider>
  );
};
