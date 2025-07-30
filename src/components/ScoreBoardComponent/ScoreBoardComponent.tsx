import styles from './ScoreBoardComponent.module.css';
import type { UserScore } from '../../types';

interface ScoreBoardProps {
  users: UserScore[];
  roundMaster: string;
}

const ScoreBoardComponent = ({ users, roundMaster }: ScoreBoardProps) => {
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  return (
    <div className={styles.scoreContainer}>
      <h2 className={styles.title}>Placar</h2>
      <ul className={styles.scoreList}>
        {sortedUsers.map((user) => (
          <li key={user.username} className={styles.scoreItem}>
            <span className={styles.username}>
              {user.username === roundMaster && '👑 '}
              {user.username}
            </span>
            <span className={styles.points}>{user.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreBoardComponent;