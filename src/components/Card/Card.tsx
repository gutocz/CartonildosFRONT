import styles from './Card.module.css';

interface CardProps {
  content: string;
  type: 'question' | 'answer';
  isClickable?: boolean;
  onClick?: () => void;
}

const Card = ({ content, type, isClickable = false, onClick = () => {} }: CardProps) => {
  const cardClasses = [
    styles.card,
    type === 'question' ? styles.questionCard : styles.answerCard,
    isClickable ? styles.clickable : styles.disabled,
  ].join(' ');

  return (
    <div className={cardClasses} onClick={isClickable ? onClick : undefined}>
      <p className={styles.cardText} dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
};

export default Card;