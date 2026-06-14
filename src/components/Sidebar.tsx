import React from 'react';
import { RouteFactors } from '../types/routing';

interface SidebarProps {
  factors: RouteFactors;
  onFactorsChange: (factors: RouteFactors) => void;
  onCalculate: () => void;
  loading: boolean;
  startPoint: string;
  endPoint: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  factors, 
  onFactorsChange, 
  onCalculate, 
  loading,
  startPoint,
  endPoint
}) => {
  const handleChange = (key: keyof RouteFactors) => {
    onFactorsChange({ ...factors, [key]: !factors[key] });
  };

  return (
    <div className="sidebar">
      <h2>Route Optimizer</h2>
      
      <div className="input-group">
        <label>Start Point</label>
        <input type="text" value={startPoint} readOnly placeholder="Click on map to set start" />
      </div>
      
      <div className="input-group">
        <label>End Point</label>
        <input type="text" value={endPoint} readOnly placeholder="Click on map to set end" />
      </div>

      <div className="checkbox-group">
        <label className="checkbox-item">
          <input 
            type="checkbox" 
            checked={factors.distance} 
            onChange={() => handleChange('distance')} 
          />
          Minimize Distance
        </label>
        <label className="checkbox-item">
          <input 
            type="checkbox" 
            checked={factors.traffic} 
            onChange={() => handleChange('traffic')} 
          />
          Avoid Traffic
        </label>
        <label className="checkbox-item">
          <input 
            type="checkbox" 
            checked={factors.co2} 
            onChange={() => handleChange('co2')} 
          />
          Low CO2 Emission
        </label>
      </div>

      <button 
        className="btn-calculate" 
        onClick={onCalculate} 
        disabled={loading || !startPoint || !endPoint}
      >
        {loading ? 'Calculating...' : 'Optimize Route'}
      </button>

      <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <p>Tip: Click on the map to set Start and End points.</p>
      </div>
    </div>
  );
};
