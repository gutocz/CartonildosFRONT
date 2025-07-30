import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import styles from './ChatComponent.module.css';
import type { User, WebSocketMessage } from '../../types';

type Message = {
  type: 'my' | 'other' | 'system';
  text: string;
};

function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { messages: wsMessages, sendMessage: sendWsMessage } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sendWsMessage('getMyUser', "");
  }, [sendWsMessage]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastMessage: WebSocketMessage | undefined = wsMessages[wsMessages.length - 1];
    if (lastMessage) {
      switch (lastMessage.type) {
        case "chat":
          if (lastMessage.payload.startsWith(currentUser?.username ?? '@@@')) {
             // Handled locally
          } else if (lastMessage.payload.includes("entrou na sala") || lastMessage.payload.includes("saiu da sala")) {
            setMessages(prev => [...prev, { type: 'system', text: lastMessage.payload }]);
          } else {
            setMessages(prev => [...prev, { type: 'other', text: lastMessage.payload }]);
          }
          break;
        case "getUserResponse":
          setCurrentUser(lastMessage.payload);
          break;
        default:
          break;
      }
    }
  }, [wsMessages, currentUser]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !currentUser) return;
    const messagePayload = `${currentUser.username}: ${inputValue}`;
    sendWsMessage('chat', messagePayload);
    setMessages(prev => [...prev, { type: 'my', text: `Você: ${inputValue}` }]);
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesBox}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className={styles.chatInput}
        />
        <button onClick={handleSendMessage} className={styles.chatButton}>
          Enviar
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;