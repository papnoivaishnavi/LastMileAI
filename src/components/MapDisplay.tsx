import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Coordinates } from '../types/routing';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DELHI_CENTER: [number, number] = [28.6139, 77.2090];

const PARCEL_ICON = L.divIcon({
  html: `<div style="color: #f59e0b; filter: drop-shadow(0 0 2px white);">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 2L4 5v11l8 3 8-3V5l-8-3zm0 2.18L18.23 6.5 12 8.82 5.77 6.5 12 4.18zM6 15.14V8.04l5 1.88v7.11l-5-1.89zm12 0l-5 1.89V9.92l5-1.88v7.1z"/>
          </svg>
        </div>`,
  className: 'parcel-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const CAR_ICON = L.divIcon({
  html: `<div style="color: #10b981; filter: drop-shadow(0 0 3px white);">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.3 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>`,
  className: 'car-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const START_ICON = L.divIcon({
  html: `<div style="color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
  className: 'start-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const END_ICON = L.divIcon({
  html: `<div style="color: #ef4444;">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
          </svg>
        </div>`,
  className: 'end-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

interface MapDisplayProps {
  path?: Coordinates[];
  start?: Coordinates;
  end?: Coordinates;
  onMapClick: (latlng: L.LatLng) => void;
  onDeliveryComplete: (success: boolean, lockerName?: string) => void;
}

const RecenterMap: React.FC<{ path?: Coordinates[] }> = ({ path }) => {
  const map = useMap();
  React.useEffect(() => {
    if (path && path.length > 1) {
      const bounds = L.latLngBounds(path.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
};

const MapEvents: React.FC<{ onClick: (latlng: L.LatLng) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

const MainPathAnimation: React.FC<{ path: Coordinates[]; onComplete: () => void; color?: string }> = ({ path, onComplete, color = "#10b981" }) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const completedRef = useRef(false);

  useEffect(() => {
    setProgress(0);
    completedRef.current = false;
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current!;
      const duration = Math.max(path.length * 100, 1000);
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [path]);

  const pointIndex = Math.floor(progress * (path.length - 1));
  const completedPath = path.slice(0, pointIndex + 1).map(p => [p.lat, p.lng] as [number, number]);
  const currentPos = path[pointIndex];

  return (
    <>
      <Polyline positions={completedPath} color={color} weight={6} opacity={0.9} />
      {currentPos && (
        <Marker position={[currentPos.lat, currentPos.lng]} icon={CAR_ICON} zIndexOffset={1000} />
      )}
    </>
  );
};

interface Trip {
  id: number;
  path: [number, number][];
  progress: number;
  startTime: number;
}

const DriverAnimation: React.FC<{ psLocations: any[] }> = ({ psLocations }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (psLocations.length < 2) return;

    const startTrip = async () => {
      const start = psLocations[Math.floor(Math.random() * psLocations.length)];
      let end = psLocations[Math.floor(Math.random() * psLocations.length)];
      while (end.id === start.id) {
        end = psLocations[Math.floor(Math.random() * psLocations.length)];
      }

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const path = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          const newTrip: Trip = {
            id: Date.now() + Math.random(),
            path,
            progress: 0,
            startTime: Date.now()
          };
          setTrips(prev => [...prev.slice(-4), newTrip]);
        }
      } catch (e) {
        console.error('Failed to fetch trip path:', e);
      }
    };

    const interval = setInterval(startTrip, 8000);
    startTrip();

    return () => clearInterval(interval);
  }, [psLocations]);

  const animate = () => {
    setTrips(prevTrips => {
      const now = Date.now();
      return prevTrips
        .map(trip => {
          const elapsed = now - trip.startTime;
          const duration = trip.path.length * 200;
          return {
            ...trip,
            progress: Math.min(elapsed / duration, 1)
          };
        })
        .filter(trip => trip.progress < 1);
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      {trips.map(trip => {
        const pointIndex = Math.floor(trip.progress * (trip.path.length - 1));
        const point = trip.path[pointIndex];
        if (!point) return null;
        return (
          <Marker key={trip.id} position={point as [number, number]} icon={PARCEL_ICON} opacity={0.8} />
        );
      })}
    </>
  );
};

export const MapDisplay: React.FC<MapDisplayProps> = ({ path, start, end, onMapClick, onDeliveryComplete }) => {
  const [psLocations, setPsLocations] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activePath, setActivePath] = useState<Coordinates[] | undefined>(path);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingLocker, setPendingLocker] = useState<string | undefined>();

  useEffect(() => {
    setActivePath(path);
    setIsRedirecting(false);
    setShowPopup(false);
  }, [path]);

  useEffect(() => {
    const fetchPS = async () => {
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"post_office|post_box|parcel_locker"](28.4, 76.8, 28.9, 77.4);
        );
        out body;
      `;
      try {
        const response = await fetch(`${overpassUrl}?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        setPsLocations(data.elements || []);
      } catch (error) {
        console.error('Error fetching PS locations:', error);
      }
    };

    fetchPS();
  }, []);

  const handleYes = () => {
    onDeliveryComplete(true);
    setShowPopup(false);
    setActivePath(undefined);
  };

  const handleNo = async () => {
    if (!end || psLocations.length === 0) {
      onDeliveryComplete(false);
      setShowPopup(false);
      setActivePath(undefined);
      return;
    }

    let nearest = psLocations[0];
    let minDist = Infinity;

    psLocations.forEach(ps => {
      const d = Math.sqrt(Math.pow(ps.lat - end.lat, 2) + Math.pow(ps.lon - end.lng, 2));
      if (d < minDist) {
        minDist = d;
        nearest = ps;
      }
    });

    const lockerName = nearest.tags.name || 'Locker near ' + (nearest.tags.street || 'destination');
    setPendingLocker(lockerName);
    setShowPopup(false);

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${end.lng},${end.lat};${nearest.lon},${nearest.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const redirectRoute = data.routes[0].geometry.coordinates.map((c: any) => ({
          lat: c[1],
          lng: c[0]
        }));
        setIsRedirecting(true);
        setActivePath(redirectRoute);
      } else {
        onDeliveryComplete(false, lockerName);
        setActivePath(undefined);
      }
    } catch (e) {
      console.error('Failed to fetch redirect route:', e);
      onDeliveryComplete(false, lockerName);
      setActivePath(undefined);
    }
  };

  const handlePathComplete = () => {
    if (!isRedirecting) {
      setShowPopup(true);
    } else {
      onDeliveryComplete(false, pendingLocker);
      setActivePath(undefined);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <MapContainer 
        center={DELHI_CENTER} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        maxBounds={[
          [28.2, 76.5],
          [29.2, 77.8]
        ]}
        minZoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onClick={onMapClick} />
        
        {psLocations.map((ps: any) => (
          <Marker 
            key={ps.id} 
            position={[ps.lat, ps.lon]} 
            icon={PARCEL_ICON}
          >
            <Popup>
              <strong>{ps.tags.name || 'Parcel Locker'}</strong><br />
              {ps.tags.amenity.replace('_', ' ')}
            </Popup>
          </Marker>
        ))}

        <DriverAnimation psLocations={psLocations} />

        {activePath && activePath.length > 0 && (
          <MainPathAnimation 
            path={activePath} 
            onComplete={handlePathComplete} 
            color={isRedirecting ? "#f59e0b" : "#10b981"}
          />
        )}

        {start && (
          <Marker position={[start.lat, start.lng]} icon={START_ICON}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        {end && (
          <Marker position={[end.lat, end.lng]} icon={END_ICON}>
            <Popup>Drop-off Location</Popup>
          </Marker>
        )}
        
        <RecenterMap path={path} />
      </MapContainer>

      {showPopup && (
        <div className="delivery-popup-overlay">
          <div className="delivery-popup">
            <h3>Delivery Successful?</h3>
            <div className="popup-actions">
              <button className="btn-yes" onClick={handleYes}>Yes</button>
              <button className="btn-no" onClick={handleNo}>No</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .delivery-popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
        }
        .delivery-popup {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
          color: #1f2937;
        }
        .delivery-popup h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }
        .popup-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .popup-actions button {
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-yes {
          background-color: #10b981;
          color: white;
        }
        .btn-no {
          background-color: #ef4444;
          color: white;
        }
        .popup-actions button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};
