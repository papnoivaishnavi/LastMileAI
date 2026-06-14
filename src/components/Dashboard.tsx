import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MapDisplay } from './MapDisplay';
import { StatsBanner } from './StatsBanner';
import { DynamicIsland } from './DynamicIsland';
import { ManagementView, Order } from './ManagementView';
import { RouteFactors, RouteResult, Coordinates } from '../types/routing';
import { ApiRouteOptimizer } from '../services/apiOptimizer';
import '../styles/dashboard.css';

const optimizer = new ApiRouteOptimizer();

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-7721', status: 'In Transit', destination: 'Connaught Place, Delhi', time: '12 mins', driver: 'Rahul S.', otp: '1234' },
  { id: 'ORD-8842', status: 'In Transit', destination: 'Hauz Khas Village', time: '24 mins', driver: 'Priya M.', otp: '5678' },
  { id: 'ORD-3310', status: 'Delayed', destination: 'Rohini Sector 11', time: '45 mins', driver: 'Amit K.', otp: '9012' },
  { id: 'ORD-9956', status: 'In Transit', destination: 'Gurgaon Sector 44', time: '18 mins', driver: 'Sonia G.', otp: '3456' },
  { id: 'ORD-1123', status: 'Completed', destination: 'Noida Phase 2', time: '0 mins', driver: 'Vikram R.' },
  { id: 'ORD-4457', status: 'Pending', destination: 'Dwarka Sector 10', time: 'Pending', driver: 'Unassigned', otp: '7890' },
];

export const Dashboard: React.FC = () => {
  const [mode, setMode] = useState<'delivery' | 'management'>('delivery');
  const [factors, setFactors] = useState<RouteFactors>({
    distance: true,
    traffic: false,
    co2: false,
  });
  const [start, setStart] = useState<Coordinates | null>(null);
  const [end, setEnd] = useState<Coordinates | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const handleMapClick = (latlng: L.LatLng) => {
    const coords = { lat: latlng.lat, lng: latlng.lng };
    if (!start || (start && end)) {
      setStart(coords);
      setEnd(null);
      setRouteResult(null);
      setCurrentOrderId(null);
    } else {
      setEnd(coords);
    }
  };

  const handleCalculate = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const result = await optimizer.calculateRoute(start, end, factors);
      setRouteResult(result);
      
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'In Transit',
        destination: `${end.lat.toFixed(4)}, ${end.lng.toFixed(4)}`,
        time: `${result.estimatedTime} mins`,
        driver: 'You (AI Pilot)',
        otp: generatedOtp
      };
      setOrders(prev => [newOrder, ...prev]);
      setCurrentOrderId(newOrder.id);
    } catch (error) {
      console.error('Failed to calculate route:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryComplete = (success: boolean, lockerName?: string) => {
    if (!currentOrderId) return;
    
    setOrders(prev => prev.map(order => {
      if (order.id === currentOrderId) {
        if (success) {
          return { ...order, status: 'Completed', time: '0 mins' };
        } else {
          return { 
            ...order, 
            status: 'Pending Delivery', 
            destination: lockerName || 'Nearby Parcel Locker',
            time: 'Awaiting Pickup'
          };
        }
      }
      return order;
    }));
  };

  const startLabel = start ? `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}` : '';
  const endLabel = end ? `${end.lat.toFixed(4)}, ${end.lng.toFixed(4)}` : '';
  const currentOrder = orders.find(o => o.id === currentOrderId);

  return (
    <div className="dashboard-container">
      <DynamicIsland mode={mode} onModeChange={setMode} />
      
      {mode === 'delivery' ? (
        <>
          <Sidebar 
            factors={factors} 
            onFactorsChange={setFactors} 
            onCalculate={handleCalculate} 
            loading={loading}
            startPoint={startLabel}
            endPoint={endLabel}
          />
          <div className="main-content">
            <StatsBanner 
              distance={routeResult?.totalDistance}
              time={routeResult?.estimatedTime}
              predictionTime={routeResult?.predictionTime}
              co2={routeResult?.co2Emissions}
            />
            <MapDisplay 
              path={routeResult?.path}
              start={start || undefined}
              end={end || undefined}
              expectedOtp={currentOrder?.otp}
              onMapClick={handleMapClick}
              onDeliveryComplete={handleDeliveryComplete}
            />
          </div>
        </>
      ) : (
        <div className="main-content">
          <ManagementView orders={orders} />
        </div>
      )}
    </div>
  );
};
