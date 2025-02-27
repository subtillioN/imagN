import React from 'react';
import styles from '../../styles/base.module.css';

interface DevToolsButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const DevToolsButton: React.FC<DevToolsButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={styles.button}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      {isOpen ? 'Hide Dev Tools' : 'Show Dev Tools'}
    </button>
  );
};

export default DevToolsButton; 