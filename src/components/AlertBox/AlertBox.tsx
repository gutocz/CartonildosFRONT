import styles from './AlertBox.module.css';

interface AlertBoxProps {
  message: string;
  onClose: () => void;
}

const AlertBox = ({ message, onClose }: AlertBoxProps) => {
  return (
    <div className={styles.errorContainer}>
      <p className={styles.errorMessage}>{message}</p>
      <button onClick={onClose} className={styles.closeButton}>
        &times;
      </button>
    </div>
  );
};

export default AlertBox;