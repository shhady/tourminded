'use client';

import { useEffect, useRef } from 'react';

export default function Error({ error, reset }) {
  const hasLogged = useRef(false);
  
  useEffect(() => {
    // Prevent infinite recursion by logging only once
    if (!hasLogged.current) {
      // Log the error to an error reporting service
      console.error('Application error:', error);
      hasLogged.current = true;
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
} 