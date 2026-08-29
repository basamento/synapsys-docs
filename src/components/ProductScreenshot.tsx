import type { ReactNode } from 'react';

import styles from './ProductScreenshot.module.css';

type ProductScreenshotProps = {
  src: string;
  alt: string;
  caption: ReactNode;
  label?: string;
};

export default function ProductScreenshot({
  src,
  alt,
  caption,
  label = 'Synapsys Core',
}: ProductScreenshotProps): ReactNode {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <div className={styles.bar} aria-hidden="true">
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.label}>{label}</span>
          <span className={styles.spacer} />
        </div>
        <img className={styles.image} src={src} alt={alt} loading="lazy" />
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
