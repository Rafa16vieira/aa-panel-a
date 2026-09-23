import { useEffect, useId, type ReactNode } from 'react';
import './LiderancaFormModal.css';

interface LiderancaFormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function LiderancaFormModal({ title, open, onClose, children }: LiderancaFormModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lideranca-modal" role="presentation">
      <div className="lideranca-modal__overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="lideranca-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="lideranca-modal__header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="lideranca-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <div className="lideranca-modal__body">{children}</div>
      </div>
    </div>
  );
}
