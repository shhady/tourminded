"use client";
import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleActiveButton({ guideId, currentActive }) {
  const [isActive, setIsActive] = useState(currentActive);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleToggle = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/guides/${guideId}/activate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active: !isActive })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setIsActive(!isActive);
          // Refresh the page to show updated status
          router.refresh();
        } else {
          setError(data.error || 'Failed to update guide status');
        }
      } catch (err) {
        setError('Network error occurred');
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded">
          {error}
        </div>
      )}
      <button
        className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
          isActive 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={pending}
        onClick={handleToggle}
      >
        {pending ? 'Updating...' : (isActive ? 'Deactivate Guide' : 'Activate Guide')}
      </button>
    </div>
  );
} 