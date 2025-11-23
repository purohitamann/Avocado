"use client";

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

interface GoogleMapViewProps {
  city: string;
}

export const GoogleMapView = ({ city }: GoogleMapViewProps) => {
  // Toronto coordinates
  const torontoPosition = { lat: 43.6532, lng: -79.3832 };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
              <p className="text-lg text-charcoal-500 font-light">Toronto, Canada</p>
              <p className="text-sm text-charcoal-400 font-light">43.6532°N, 79.3832°W</p>
            </div>
            <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                <strong>To enable interactive map:</strong><br/>
                1. Get API key from Google Cloud Console<br/>
                2. Enable "Maps JavaScript API"<br/>
                3. Add to .env.local file<br/>
                4. Restart dev server
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full">
        <Map
          defaultCenter={torontoPosition}
          defaultZoom={12}
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
          <Marker position={torontoPosition} title={city} />
        </Map>
      </div>
    </APIProvider>
  );
};
