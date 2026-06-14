import React from 'react';

interface DynamicIslandProps {
  mode: 'delivery' | 'management';
  onModeChange: (mode: 'delivery' | 'management') => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ mode, onModeChange }) => {
  return (
    <div className="dynamic-island-container">
      <div className="dynamic-island">
        <button 
          className={`mode-btn ${mode === 'delivery' ? 'active' : ''}`}
          onClick={() => onModeChange('delivery')}
        >
          Delivery
        </button>
        <button 
          className={`mode-btn ${mode === 'management' ? 'active' : ''}`}
          onClick={() => onModeChange('management')}
        >
          Management
        </button>
      </div>
    </div>
  );
};
