import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import LobbyPage from './pages/Lobby/LobbyPage';
import GamePage from './pages/Game/GamePage';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;