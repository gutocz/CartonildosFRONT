import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import AlertBox from '../../components/AlertBox/AlertBox';
import styles from './LobbyPage.module.css';
import type { WebSocketMessage } from '../../types';

function LobbyPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { messages, sendMessage, isConnected } = useWebSocket();

  const handleJoinRoom = () => {
    if (inputValue.trim()) {
      sendMessage('joinRoom', inputValue.trim());
    } else {
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
          break;
        case "sucessJoinRoom":
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
        <h1 className={styles.title}>Cartas Contra a Humanidade</h1>
        <p className={styles.subtitle}>Entre em uma sala para jogar</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite seu nick..."
          className={styles.nickInput}
          maxLength={20}
        />
        <button 
          onClick={handleJoinRoom} 
          className={styles.joinButton} 
          disabled={!isConnected}
        >
          {isConnected ? 'Entrar na Sala' : 'Conectando...'}
        </button>
      </div>
    </div>
  );
}

export default LobbyPage;