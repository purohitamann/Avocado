"use client";

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GoogleMapViewProps {
  city: string;
}

// Fallback coordinates database for common cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "New York": { "lat": 40.7128, "lng": -74.0060 },
  "Los Angeles": { "lat": 34.0522, "lng": -118.2437 },
  "Chicago": { "lat": 41.8781, "lng": -87.6298 },
  "Houston": { "lat": 29.7604, "lng": -95.3698 },
  "Phoenix": { "lat": 33.4484, "lng": -112.0740 },
  "Philadelphia": { "lat": 39.9526, "lng": -75.1652 },
  "San Antonio": { "lat": 29.4241, "lng": -98.4936 },
  "San Diego": { "lat": 32.7157, "lng": -117.1611 },
  "Dallas": { "lat": 32.7767, "lng": -96.7970 },
  "Austin": { "lat": 30.2672, "lng": -97.7431 },
  "San Francisco": { "lat": 37.7749, "lng": -122.4194 },
  "Seattle": { "lat": 47.6062, "lng": -122.3321 },
  "Denver": { "lat": 39.7392, "lng": -104.9903 },
  "Miami": { "lat": 25.7617, "lng": -80.1918 },
  "Boston": { "lat": 42.3601, "lng": -71.0589 },
  "Atlanta": { "lat": 33.7490, "lng": -84.3880 },
  "Detroit": { "lat": 42.3314, "lng": -83.0458 },
  "Minneapolis": { "lat": 44.9778, "lng": -93.2650 },
  "Portland": { "lat": 45.5152, "lng": -122.6784 },
  "Las Vegas": { "lat": 36.1699, "lng": -115.1398 },
  "Orlando": { "lat": 28.5383, "lng": -81.3792 },
  "Tampa": { "lat": 27.9506, "lng": -82.4572 },
  "Charlotte": { "lat": 35.2271, "lng": -80.8431 },
  "Indianapolis": { "lat": 39.7684, "lng": -86.1581 },
  "Columbus": { "lat": 39.9612, "lng": -82.9988 },
  "Cleveland": { "lat": 41.4993, "lng": -81.6944 },
  "Cincinnati": { "lat": 39.1031, "lng": -84.5120 },
  "Kansas City": { "lat": 39.0997, "lng": -94.5786 },
  "St. Louis": { "lat": 38.6270, "lng": -90.1994 },

  "Toronto": { "lat": 43.6532, "lng": -79.3832 },
  "Vancouver": { "lat": 49.2827, "lng": -123.1207 },
  "Montreal": { "lat": 45.5017, "lng": -73.5673 },
  "Calgary": { "lat": 51.0447, "lng": -114.0719 },
  "Ottawa": { "lat": 45.4215, "lng": -75.6972 },
  "Edmonton": { "lat": 53.5461, "lng": -113.4938 },
  "Winnipeg": { "lat": 49.8951, "lng": -97.1384 },
  "Halifax": { "lat": 44.6488, "lng": -63.5752 },

  "Mexico City": { "lat": 19.4326, "lng": -99.1332 },
  "Guadalajara": { "lat": 20.6597, "lng": -103.3496 },
  "Monterrey": { "lat": 25.6866, "lng": -100.3161 },

  "London": { "lat": 51.5074, "lng": -0.1278 },
  "Paris": { "lat": 48.8566, "lng": 2.3522 },
  "Berlin": { "lat": 52.5200, "lng": 13.4050 },
  "Rome": { "lat": 41.9028, "lng": 12.4964 },
  "Madrid": { "lat": 40.4168, "lng": -3.7038 },
  "Barcelona": { "lat": 41.3851, "lng": 2.1734 },
  "Amsterdam": { "lat": 52.3676, "lng": 4.9041 },
  "Brussels": { "lat": 50.8503, "lng": 4.3517 },
  "Vienna": { "lat": 48.2082, "lng": 16.3738 },
  "Munich": { "lat": 48.1351, "lng": 11.5820 },
  "Frankfurt": { "lat": 50.1109, "lng": 8.6821 },
  "Hamburg": { "lat": 53.5511, "lng": 9.9937 },
  "Prague": { "lat": 50.0755, "lng": 14.4378 },
  "Warsaw": { "lat": 52.2297, "lng": 21.0122 },
  "Budapest": { "lat": 47.4979, "lng": 19.0402 },
  "Dublin": { "lat": 53.3498, "lng": -6.2603 },
  "Copenhagen": { "lat": 55.6761, "lng": 12.5683 },
  "Stockholm": { "lat": 59.3293, "lng": 18.0686 },
  "Oslo": { "lat": 59.9139, "lng": 10.7522 },
  "Helsinki": { "lat": 60.1699, "lng": 24.9384 },
  "Lisbon": { "lat": 38.7223, "lng": -9.1393 },
  "Zurich": { "lat": 47.3769, "lng": 8.5417 },
  "Geneva": { "lat": 46.2044, "lng": 6.1432 },
  "Milan": { "lat": 45.4642, "lng": 9.1900 },
  "Naples": { "lat": 40.8518, "lng": 14.2681 },
  "Athens": { "lat": 37.9838, "lng": 23.7275 },

  "Tokyo": { "lat": 35.6762, "lng": 139.6503 },
  "Osaka": { "lat": 34.6937, "lng": 135.5023 },
  "Seoul": { "lat": 37.5665, "lng": 126.9780 },
  "Busan": { "lat": 35.1796, "lng": 129.0756 },
  "Beijing": { "lat": 39.9042, "lng": 116.4074 },
  "Shanghai": { "lat": 31.2304, "lng": 121.4737 },
  "Shenzhen": { "lat": 22.5431, "lng": 114.0579 },
  "Guangzhou": { "lat": 23.1291, "lng": 113.2644 },
  "Hong Kong": { "lat": 22.3193, "lng": 114.1694 },
  "Taipei": { "lat": 25.0330, "lng": 121.5654 },
  "Bangkok": { "lat": 13.7563, "lng": 100.5018 },
  "Singapore": { "lat": 1.3521, "lng": 103.8198 },
  "Kuala Lumpur": { "lat": 3.1390, "lng": 101.6869 },
  "Jakarta": { "lat": -6.2088, "lng": 106.8456 },
  "Manila": { "lat": 14.5995, "lng": 120.9842 },
  "Hanoi": { "lat": 21.0278, "lng": 105.8342 },
  "Ho Chi Minh City": { "lat": 10.8231, "lng": 106.6297 },
  "Delhi": { "lat": 28.7041, "lng": 77.1025 },
  "Mumbai": { "lat": 19.0760, "lng": 72.8777 },
  "Bangalore": { "lat": 12.9716, "lng": 77.5946 },
  "Chennai": { "lat": 13.0827, "lng": 80.2707 },
  "Dubai": { "lat": 25.2048, "lng": 55.2708 },
  "Abu Dhabi": { "lat": 24.4539, "lng": 54.3773 },
  "Doha": { "lat": 25.2854, "lng": 51.5310 },

  "Sydney": { "lat": -33.8688, "lng": 151.2093 },
  "Melbourne": { "lat": -37.8136, "lng": 144.9631 },
  "Brisbane": { "lat": -27.4698, "lng": 153.0251 },
  "Perth": { "lat": -31.9505, "lng": 115.8605 },
  "Auckland": { "lat": -36.8485, "lng": 174.7633 },
  "Wellington": { "lat": -41.2865, "lng": 174.7762 },

  "São Paulo": { "lat": -23.5505, "lng": -46.6333 },
  "Rio de Janeiro": { "lat": -22.9068, "lng": -43.1729 },
  "Buenos Aires": { "lat": -34.6037, "lng": -58.3816 },
  "Santiago": { "lat": -33.4489, "lng": -70.6693 },
  "Lima": { "lat": -12.0464, "lng": -77.0428 },
  "Bogotá": { "lat": 4.7110, "lng": -74.0721 },
  "Quito": { "lat": -0.1807, "lng": -78.4678 },
  "Caracas": { "lat": 10.4806, "lng": -66.9036 },

  "Cairo": { "lat": 30.0444, "lng": 31.2357 },
  "Johannesburg": { "lat": -26.2041, "lng": 28.0473 },
  "Cape Town": { "lat": -33.9249, "lng": 18.4241 },
  "Nairobi": { "lat": -1.2921, "lng": 36.8219 },
  "Lagos": { "lat": 6.5244, "lng": 3.3792 },
  "Accra": { "lat": 5.6037, "lng": -0.1870 },
  "Casablanca": { "lat": 33.5731, "lng": -7.5898 },
  "Marrakesh": { "lat": 31.6295, "lng": -7.9811 }
}


export const GoogleMapView = ({ city }: GoogleMapViewProps) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapKey, setMapKey] = useState(0); // Force map re-render on city change
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchCoordinates = async () => {
      const normalizedCity = city.trim();
      
      // Try fallback database first for instant loading
      let coords = CITY_COORDINATES[normalizedCity];
      
      // Try without country suffix
      if (!coords) {
        const cityOnly = normalizedCity.split(',')[0].trim();
        coords = CITY_COORDINATES[cityOnly];
      }
      
      // Try case-insensitive match
      if (!coords) {
        const cityLower = normalizedCity.toLowerCase();
        const matchedKey = Object.keys(CITY_COORDINATES).find(key => 
          key.toLowerCase() === cityLower || 
          key.toLowerCase().split(',')[0].trim() === cityLower
        );
        if (matchedKey) {
          coords = CITY_COORDINATES[matchedKey];
        }
      }
      
      // If found in database, use it immediately
      if (coords) {
        setCoordinates(coords);
        setMapKey(prev => prev + 1);
        console.log('🗺️ Map coordinates from database:', { 
          city: normalizedCity, 
          coords,
          found: true 
        });
        return;
      }
      
      // If not in database and API key available, try Geocoding API
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        setGeocodeError(`City "${normalizedCity}" not found in database`);
        return;
      }
      
      setIsGeocoding(true);
      setGeocodeError(null);
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedCity)}&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding request failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCoordinates({ lat: location.lat, lng: location.lng });
          setMapKey(prev => prev + 1);
          console.log('🗺️ Map coordinates fetched via API:', { 
            city: normalizedCity, 
            coords: location,
            found: true 
          });
        } else {
          setGeocodeError(`Could not find location for "${normalizedCity}"`);
          console.log('🗺️ City not found via geocoding:', normalizedCity, data.status);
        }
      } catch (error) {
        console.error('🗺️ Geocoding error:', error);
        setGeocodeError('Failed to fetch location data');
      } finally {
        setIsGeocoding(false);
      }
    };
    
    fetchCoordinates();
  }, [city, apiKey]);

  // Show fallback if no API key is configured
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-full bg-linear-to-br from-avocado-100/40 via-mint-50/30 to-avocado-200/40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-32 h-32 mx-auto rounded-3xl glass-strong flex items-center justify-center frosted-overlay-avocado">
              <MapPin className="w-16 h-16 text-avocado-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-charcoal-800 tracking-tight">{city}</h2>
            </div>
            <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                <strong>To enable interactive map:</strong><br/>
                1. Get API key from Google Cloud Console<br/>
                2. Enable "Maps JavaScript API" and "Geocoding API"<br/>
                3. Add to .env.local file<br/>
                4. Restart dev server
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while geocoding
  if (isGeocoding || !coordinates) {
    return (
      <div className="w-full h-full bg-linear-to-br from-avocado-100/40 via-mint-50/30 to-avocado-200/40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-32 h-32 mx-auto rounded-3xl glass-strong flex items-center justify-center frosted-overlay-avocado">
              <MapPin className="w-16 h-16 text-avocado-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-charcoal-800 tracking-tight">{city}</h2>
              {isGeocoding && (
                <p className="text-sm text-charcoal-500 font-light">Locating on map...</p>
              )}
              {!isGeocoding && geocodeError && (
                <p className="text-sm text-red-500 font-light">{geocodeError}</p>
              )}
              {coordinates && (
                <p className="text-lg text-charcoal-500 font-light">
                  {coordinates.lat.toFixed(4)}°N, {Math.abs(coordinates.lng).toFixed(4)}°{coordinates.lng < 0 ? 'W' : 'E'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full relative">
        <Map
          key={mapKey}
          center={coordinates}
          zoom={12}
          mapId="avocado-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={[
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ saturation: 10 }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#a8e4da" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry",
              stylers: [{ color: "#f0fdf4" }]
            }
          ]}
        >
          <Marker position={coordinates} title={city} />
        </Map>
      </div>
    </APIProvider>
  );
};
