import React from 'react';

interface StatsBannerProps {
  distance?: number;
  time?: number;
  predictionTime?: number;
  co2?: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ distance, time, predictionTime, co2 }) => {
  return (
    <div className="stats-banner">
      <div className="stat-item">
        <span className="stat-value">{distance ? `${distance} km` : '--'}</span>
        <span className="stat-label">Distance</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{time ? `${time} min` : '--'}</span>
        <span className="stat-label">Est. Time</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#10b981' }}>{predictionTime ? `${predictionTime} min` : '--'}</span>
        <span className="stat-label">LSTM Prediction</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{co2 ? `${co2} kg` : '--'}</span>
        <span className="stat-label">CO2 Emission</span>
      </div>
    </div>
  );
};
