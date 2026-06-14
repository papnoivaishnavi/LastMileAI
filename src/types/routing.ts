export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteFactors {
  distance: boolean;
  traffic: boolean;
  co2: boolean;
}

export interface RouteResult {
  path: Coordinates[];
  totalDistance: number;
  estimatedTime: number;
  predictionTime: number;
  co2Emissions: number;
}
