import React from 'react';

interface LoadingProps {
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({ size = 150 }) => {
  return (
    <div className="loading-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <img 
        src="/loader.gif" 
        alt="Loading..." 
        style={{
          width: size,
          height: size
        }}
      />
    </div>
  );
};

export default Loading;