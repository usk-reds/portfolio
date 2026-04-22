import { useState, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  passwordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { error, passwordToggle, className, type, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);

  const resolvedType = passwordToggle ? (show ? 'text' : 'password') : type;

  return (
    <div>
      <div className={styles.wrap}>
        <input
          ref={ref}
          type={resolvedType}
          className={[styles.input, error ? styles.error : '', className].filter(Boolean).join(' ')}
          {...rest}
        />
        {passwordToggle && (
          <button type="button" className={styles.toggle} onClick={() => setShow((s) => !s)}>
            {show ? '隠す' : '表示'}
          </button>
        )}
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
});

export default Input;
