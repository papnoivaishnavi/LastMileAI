import requests
import json

def get_osm_route(start_lat, start_lng, end_lat, end_lng):
    """
    Fetches a real road-based route from OSRM (OpenStreetMap data).
    This can be used by the ML model to understand road networks and 
    predict travel times based on actual street geometry.
    """
    url = f"https://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if response.status_code == 200 and data.get('routes'):
            route = data['routes'][0]
            distance = route['distance'] / 1000  # km
            duration = route['duration'] / 60     # minutes
            geometry = route['geometry']
            
            print(f"Route found: {distance:.2f} km, {duration:.1f} mins")
            return {
                "distance_km": distance,
                "duration_min": duration,
                "geometry": geometry
            }
        else:
            print("Error: Could not fetch route from OSM.")
            return None
    except Exception as e:
        print(f"OSM Fetch Exception: {e}")
        return None

def fetch_osm_network_data(bbox):
    """
    Fetches raw road network data (nodes and ways) for a bounding box
    using the Overpass API. This is ideal for training ML models on
    local geography.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      way["highway"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
    );
    out body;
    >;
    out skel qt;
    """
    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        return response.json()
    except Exception as e:
        print(f"Overpass Fetch Exception: {e}")
        return None

if __name__ == "__main__":
    # Example: Delhi (NCT) Coordinates
    delhi_start = [28.6139, 77.2090]
    delhi_end = [28.5355, 77.3910]
    
    # Get a real road route
    route_info = get_osm_route(*delhi_start, *delhi_end)
    
    # Bounding box for Central Delhi [min_lat, min_lon, max_lat, max_lon]
    central_delhi_bbox = [28.60, 77.20, 28.63, 77.23]
    network_data = fetch_osm_network_data(central_delhi_bbox)
    
    if network_data:
        print(f"Fetched {len(network_data.get('elements', []))} OSM network elements for model training.")
