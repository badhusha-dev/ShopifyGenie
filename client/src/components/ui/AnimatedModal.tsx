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
      <style jsx>{`
        .animated-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1055;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: backdropFadeIn 0.3s ease;
        }

        .animated-modal-dialog {
          margin: 0;
          animation: modalSlideIn 0.4s ease;
        }

        .animated-modal-content {
          border: none;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .modal-header {
          background: linear-gradient(135deg, var(--shopify-green-light) 0%, var(--shopify-green) 100%);
          color: white;
          border-bottom: none;
          padding: 1.5rem;
        }

        .modal-header .btn-close {
          filter: invert(1);
          opacity: 0.8;
        }

        .modal-header .btn-close:hover {
          opacity: 1;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-footer {
          border-top: 1px solid #e0e6ed;
          padding: 1.5rem;
          background-color: #f8f9fa;
        }

        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .animated-modal-dialog {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
          
          .modal-body {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedModal;