import React from 'react';

export interface Order {
  id: string;
  status: string;
  destination: string;
  time: string;
  driver: string;
}

interface ManagementViewProps {
  orders: Order[];
}

export const ManagementView: React.FC<ManagementViewProps> = ({ orders }) => {
  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Active Deliveries</h1>
        <div style={{ color: 'var(--text-dim)' }}>
          Total active orders: {orders.filter(o => o.status !== 'Completed').length}
        </div>
      </div>
      
      <div className="order-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-id">{order.id}</div>
            <div className="order-status" style={{ 
              backgroundColor: 
                order.status === 'Delayed' ? 'rgba(239, 68, 68, 0.1)' : 
                order.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' :
                order.status === 'Pending Delivery' ? 'rgba(245, 158, 11, 0.1)' : undefined,
              color: 
                order.status === 'Delayed' ? '#ef4444' : 
                order.status === 'Completed' ? '#10b981' :
                order.status === 'Pending Delivery' ? '#f59e0b' : undefined 
            }}>
              {order.status}
            </div>
            <div className="order-info">
              <div><strong>Destination:</strong> {order.destination}</div>
              <div><strong>Est. Time:</strong> {order.time}</div>
              <div><strong>Driver:</strong> {order.driver}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
