import { useState, useEffect } from 'react';
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

    useEffect(() => {
        sendMessage('getMyUser', "");
        sendMessage('getLeader', "");
    }, [sendMessage]);

    useEffect(() => {
        const lastMessage: WebSocketMessage | undefined = messages[messages.length - 1];
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case 'getUserResponse':
                setCurrentUser(lastMessage.payload);
                break;
            case 'userListUpdate':
                setAllUsers(lastMessage.payload);
                break;
            case 'getLeaderResponse':
                setLeader(lastMessage.payload);
                break;
            case 'startGameResponse':
            case 'nextRoundResponse':
                setGameIsRunning(true);
                setRoundMaster(lastMessage.payload.roundMaster);
                setQuestion(lastMessage.payload.question);
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
                setTable(new Map(Object.entries(lastMessage.payload)));
                break;
            case 'winnerChosen':
                setWinner({ username: lastMessage.payload.winner, points: lastMessage.payload.points });
                break;
            default:
                break;
        }
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