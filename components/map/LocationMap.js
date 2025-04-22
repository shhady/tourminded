'use client';

import { useEffect, useRef } from 'react';
// Import the leaflet CSS globally in a more compatible way
// We'll move this to the MapWrapper component

const LocationMap = ({ locationName, region, coordinates }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Dynamically import Leaflet only on client side
      const L = require('leaflet');
      // Don't import CSS here - it's imported in the MapWrapper

      // Fix the issue with default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      // Initialize map if it doesn't exist yet
      if (!mapRef.current) {
        const map = L.map('map').setView(coordinates, 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker for the location
        L.marker(coordinates)
          .addTo(map)
          .bindPopup(`<b>${locationName}</b><br>${region}`)
          .openPopup();
          
        mapRef.current = map;
      } else {
        // Update existing map view and marker if the map already exists
        mapRef.current.setView(coordinates, 12);
        
        // Clear existing markers
        mapRef.current.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            mapRef.current.removeLayer(layer);
          }
        });
        
        // Add new marker
        L.marker(coordinates)
          .addTo(mapRef.current)
          .bindPopup(`<b>${locationName}</b><br>${region}`)
          .openPopup();
      }
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locationName, region, coordinates]); // Re-run effect when these props change

  return <div id="map" style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}></div>;
};

export default LocationMap; 