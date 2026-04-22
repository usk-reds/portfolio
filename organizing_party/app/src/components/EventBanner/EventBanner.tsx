import styles from './EventBanner.module.css';

interface Props {
  name: string;
  deadline: string;
}

export default function EventBanner({ name, deadline }: Props) {
  return (
    <div className={styles.banner}>
      <p className={styles.name}>{name}</p>
      <p className={styles.deadline}>回答期限：{deadline}</p>
    </div>
  );
}
