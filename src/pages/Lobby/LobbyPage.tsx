import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import AlertBox from '../../components/AlertBox/AlertBox';
import styles from './LobbyPage.module.css';
import type { WebSocketMessage } from '../../types';

function LobbyPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const navigate = useNavigate();
  const { messages, sendMessage, isConnected } = useWebSocket();

  const handleJoinRoom = () => {
    if (inputValue.trim() && !isJoining) {
      setIsJoining(true);
      sendMessage('joinRoom', inputValue.trim());
    } else if (!inputValue.trim()) {
      setError("O nome de usuário não pode ser vazio.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJoinRoom();
    }
  };

  useEffect(() => {
    const lastMessage: WebSocketMessage | undefined = messages[messages.length - 1];
    if (lastMessage) {
      switch (lastMessage.type) {
        case "error":
          setError(lastMessage.payload);
          setIsJoining(false);
          break;
        case "sucessJoinRoom":
          // The payload is now an object with user and userList
          // You can use this data to update the context or state if needed
          navigate('/game');
          break;
        default:
          break;
      }
    }
  }, [messages, navigate]);

  return (
    <div className={styles.lobbyContainer}>
      {error && <AlertBox message={error} onClose={() => setError(null)} />}
      <div className={styles.joinBox}>
        <h1 className={styles.title}>Cartonildos</h1>
        <p className={styles.subtitle}>Entre em uma sala para jogar</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite seu nick..."
          className={styles.nickInput}
          maxLength={20}
          disabled={isJoining}
        />
        <button 
          onClick={handleJoinRoom} 
          className={styles.joinButton} 
          disabled={!isConnected || isJoining}
        >
          {isConnected ? (isJoining ? 'Entrando...' : 'Entrar na Sala') : 'Conectando...'}
        </button>
      </div>
    </div>
  );
}

export default LobbyPage;
