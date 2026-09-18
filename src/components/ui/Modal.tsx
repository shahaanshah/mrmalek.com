
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap = { sm: '480px', md: '640px', lg: '800px', xl: '960px' };

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.scrollbarGutter = 'stable';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        style={{ maxWidth: maxWidthMap[maxWidth] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close modal" className="modal-close">
          <X size={18} />
        </button>

        {(title || subtitle) && (
          <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
            {title && <h3 className="modal-title">{title}</h3>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
