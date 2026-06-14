import { Coordinates, RouteFactors, RouteResult } from '../types/routing';

export class ApiRouteOptimizer {
  async calculateRoute(start: Coordinates, end: Coordinates, factors: RouteFactors): Promise<RouteResult> {
    try {
      // Use OSRM Public API for real road-based routing
      // OSRM provides routes based on OpenStreetMap data, ensuring the path follows actual roads.
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const path: Coordinates[] = route.geometry.coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      const distKm = route.distance / 1000;
      const durationMin = route.duration / 60;

      // Apply factors to simulate AI/LSTM prediction logic
      let multiplier = 1.0;
      if (factors.traffic) multiplier += 0.25;
      if (factors.distance) multiplier -= 0.05;

      return {
        path,
        totalDistance: parseFloat(distKm.toFixed(2)),
        estimatedTime: Math.round(durationMin * multiplier),
        predictionTime: Math.round(durationMin * 0.9 * multiplier + (Math.random() * 3)),
        co2Emissions: parseFloat((distKm * 0.12 * (factors.co2 ? 0.8 : 1)).toFixed(2))
      };
    } catch (error) {
      console.error('OSRM Routing failed, falling back to straight line:', error);
      // Fallback to straight line if API fails
      const dist = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)) * 111;
      return {
        path: [start, end],
        totalDistance: parseFloat(dist.toFixed(2)),
        estimatedTime: Math.round(dist * 2),
        predictionTime: Math.round(dist * 1.8),
        co2Emissions: parseFloat((dist * 0.12).toFixed(2))
      };
    }
  }
}
