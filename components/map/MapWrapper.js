'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import for the map client component with no SSR
const MapClient = dynamic(
  () => import('./MapClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

const MapWrapper = ({ locationName, region, coordinates }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  return (
    <MapClient 
      locationName={locationName}
      region={region}
      coordinates={coordinates}
    />
  );
};

export default MapWrapper; 