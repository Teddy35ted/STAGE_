import React from 'react';
import { createPortal } from 'react-dom';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  if (!isOpen) return null;

  // Créer le modal dans un portail pour éviter les héritages CSS
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 ${className}`}
      style={{
        backgroundColor: 'rgba(107, 114, 128, 0.75)', // bg-gray-500 bg-opacity-75
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
