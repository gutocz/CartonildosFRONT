import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { User, UserScore, CardOnTable, WebSocketMessage } from '../../types';
import ScoreBoardComponent from '../../components/ScoreBoardComponent/ScoreBoardComponent';
import Card from '../../components/Card/Card';
import ChatComponent from '../../components/Chat/ChatComponent';
import styles from './GamePage.module.css';

function GamePage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<UserScore[]>([]);
    const [leader, setLeader] = useState<string>("");
    const [roundMaster, setRoundMaster] = useState<string>("");
    const [gameIsRunning, setGameIsRunning] = useState(false);
    const [question, setQuestion] = useState<string>("");
    const [table, setTable] = useState<Map<string, CardOnTable>>(new Map());
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [winner, setWinner] = useState<{ username: string; points: number} | null>(null);

    const { messages, sendMessage } = useWebSocket();
    const processedMessagesCount = useRef(0);

    useEffect(() => {
        sendMessage('getMyUser', "");
        sendMessage('getLeader', "");
    }, [sendMessage]);

    useEffect(() => {
        const newMessages = messages.slice(processedMessagesCount.current);
        if (newMessages.length === 0) return;

        newMessages.forEach(message => {
            if (!message) return;

            switch (message.type) {
                case 'getUserResponse':
                    setCurrentUser(message.payload);
                    break;
                case 'userListUpdate':
                    setAllUsers(message.payload);
                    break;
                case 'getLeaderResponse':
                    setLeader(message.payload);
                    break;
                case 'startGameResponse':
                case 'nextRoundResponse':
                    setGameIsRunning(true);
                    setRoundMaster(message.payload.roundMaster);
                    setQuestion(message.payload.question);
                    setTable(new Map());
                    setWinner(null);
                    setAlreadyPlayed(false);
                    break;
                case 'restartGameResponse':
                    setGameIsRunning(false);
                    setRoundMaster("");
                    setQuestion("");
                    setTable(new Map());
                    setWinner(null);
                    setAlreadyPlayed(false);
                    break;
                case 'tableResponse':
                    setTable(new Map(Object.entries(message.payload)));
                    break;
                case 'winnerChosen':
                    setWinner({ username: message.payload.winner, points: message.payload.points });
                    break;
                default:
                    break;
            }
        });

        processedMessagesCount.current = messages.length;

    }, [messages]);

    const handleHandCardClick = (cardContent: string) => {
        if (!alreadyPlayed && currentUser?.username !== roundMaster && gameIsRunning) {
            sendMessage('addCardToTable', { owner: currentUser?.username, cardContent });
            setAlreadyPlayed(true);
        }
    };
    
    const handleTableCardClick = (owner: string, cardData: CardOnTable) => {
        const isCurrentUserRoundMaster = currentUser?.username === roundMaster;
        if (!isCurrentUserRoundMaster || !gameIsRunning) return;

        if (!cardData.revealed) {
            sendMessage('revealCard', { owner });
        } else {
            sendMessage('chooseWinner', { winnerUsername: owner });
        }
    };
    
    const handleStartClick = () => {
        if (gameIsRunning) {
            sendMessage('restartGame', "");
        } else {
            sendMessage('startGame', "");
        }
    };
    
    const isLeader = currentUser?.username === leader;
    const isRoundMaster = currentUser?.username === roundMaster;
    const canPlayCard = !isRoundMaster && !alreadyPlayed && gameIsRunning;
    const startButtonText = gameIsRunning ? 'Reiniciar Jogo' : 'Começar Jogo';

    return (
        <div className={styles.pageContainer}>
            <div className={styles.leftPanel}>
                <ScoreBoardComponent users={allUsers} roundMaster={roundMaster} />
                {isLeader && <button className={styles.controlButton} onClick={handleStartClick}>{startButtonText}</button>}
            </div>

            <div className={styles.mainContent}>
                {winner && (
                    <div className={styles.winnerAnnouncement}>
                        <h2>{winner.username} venceu a rodada!</h2>
                    </div>
                )}

                {!gameIsRunning && !winner && (
                     <div className={styles.waitingRoom}>
                        <h2>Aguardando o líder iniciar o jogo...</h2>
                        <p>O líder da sala é: <strong>{leader}</strong></p>
                    </div>
                )}
                
                {gameIsRunning && (
                    <>
                        <div className={styles.questionArea}>
                            <Card content={question} type="question" isClickable={false} />
                        </div>
                        <div className={styles.tableArea}>
                            {Array.from(table.entries()).map(([owner, cardData]) => (
                                <Card
                                    key={owner}
                                    content={cardData.revealed ? cardData.cardContent : "Pronta"}
                                    type="answer"
                                    isClickable={isRoundMaster && !winner}
                                    onClick={() => handleTableCardClick(owner, cardData)}
                                />
                            ))}
                        </div>
                    </>
                )}
                
                <div className={styles.handArea}>
                     {currentUser?.hand.map((cardContent, index) => (
                        <Card
                            key={index}
                            content={cardContent}
                            type="answer"
                            isClickable={canPlayCard}
                            onClick={() => handleHandCardClick(cardContent)}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.rightPanel}>
                <ChatComponent />
            </div>
        </div>
    );
}

export default GamePage;