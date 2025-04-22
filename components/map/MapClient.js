'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';

// Fix Leaflet default marker icons
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

export default function MapClient({ locationName, region, coordinates }) {
  useEffect(() => {
    // Fix the icon issue
    fixLeafletIcons();

    // Create map
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Check if map is already initialized on this element
    if (mapContainer._leaflet_id) {
      // Map already initialized, clean up
      mapContainer._leaflet_map_instance.remove();
    }

    // Create new map
    const map = L.map('map').setView(coordinates, 13);
    
    // Store reference to map instance for cleanup
    mapContainer._leaflet_map_instance = map;
    
    // Use CartoDB Light basemap (English-only labels, clean design)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & Carto',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Add marker
    L.marker(coordinates)
      .addTo(map)
      .bindPopup(`<b>${locationName}</b>`)
      .openPopup();

    // Cleanup on component unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [coordinates, locationName, region]);

  return (
    <div id="map" className={styles.mapContainer}></div>
  );
} 