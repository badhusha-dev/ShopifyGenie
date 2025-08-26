import React, { useEffect } from 'react';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  closeButton?: boolean;
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="animated-modal-backdrop" onClick={onClose}>
        <div className={`modal-dialog ${sizeClasses[size]} animated-modal-dialog`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content animated-modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{title}</h5>
              {closeButton && (
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              )}
            </div>
            <div className="modal-body">
              {children}
            </div>
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded styles for animations */}
      <style>{`
        .animated-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: var(--z-modal-backdrop, 1040);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn var(--duration-normal, 300ms) ease;
        }

        .animated-modal-dialog {
          margin: 0;
          animation: scaleIn var(--duration-slow, 500ms) ease;
        }

        .animated-modal-content {
          border: none;
          border-radius: var(--radius-2xl, 1.5rem);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .modal-header {
          background: linear-gradient(135deg, var(--shopify-green-light) 0%, var(--shopify-green) 100%);
          color: white;
          border-bottom: none;
          padding: var(--spacing-lg, 1.5rem);
        }

        .modal-header .btn-close {
          filter: invert(1);
          opacity: 0.8;
          transition: opacity var(--duration-fast, 150ms) ease;
        }

        .modal-header .btn-close:hover {
          opacity: 1;
        }

        .modal-body {
          padding: var(--spacing-xl, 2rem);
        }

        .modal-footer {
          border-top: 1px solid var(--bs-border-color);
          padding: var(--spacing-lg, 1.5rem);
          background-color: var(--bs-tertiary-bg);
        }

        /* Dark mode adjustments */
        [data-bs-theme="dark"] .animated-modal-backdrop {
          background-color: rgba(0, 0, 0, 0.7);
        }

        [data-bs-theme="dark"] .animated-modal-content {
          box-shadow: var(--shadow-xl);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .animated-modal-dialog {
            margin: var(--spacing-md, 1rem);
            width: calc(100% - 2rem);
          }
          
          .modal-body {
            padding: var(--spacing-lg, 1.5rem);
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedModal;