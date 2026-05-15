import styles from "../styles/components-style/Background.module.css";

export default function Background() {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.bubble} ${styles.b1}`} />
      <div className={`${styles.bubble} ${styles.b2}`} />
      <div className={`${styles.bubble} ${styles.b3}`} />
      <div className={`${styles.bubble} ${styles.b4}`} />
      <div className={`${styles.bubble} ${styles.b5}`} />
    </div>
  );
}