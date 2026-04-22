import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...rest }: Props) {
  return (
    <textarea
      className={[styles.textarea, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
