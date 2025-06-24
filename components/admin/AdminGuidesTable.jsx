"use client";
import React, { useTransition, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminGuidesTable({ guides: initialGuides, adminName }) {
  const [guides, setGuides] = React.useState(initialGuides);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();

  const handleToggleActive = async (id, currentActive) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/guides/${id}/activate`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive })
      });
      const data = await res.json();
      if (res.ok) {
        setGuides(guides.map(g => g._id === id ? { ...g, active: !currentActive } : g));
      } else {
        setError(data.error || 'Failed to update guide status');
      }
    });
  };

  const handleViewDetails = (guideId) => {
    const locale = params?.locale || 'en';
    router.push(`/${locale}/dashboard/admin/guides/${guideId}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-8 text-secondary-700">Welcome, {adminName}! Here you can manage guides who applied to become a guide.</p>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guides.map(guide => (
              <tr key={guide._id}>
                <td className="px-4 py-2">{guide.names?.[0]?.value || 'N/A'}</td>
                <td className="px-4 py-2">{guide.user?.email || 'N/A'}</td>
                <td className="px-4 py-2">
                  {guide.active ? (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">Active</span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Pending</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 font-bold text-xs"
                      onClick={() => handleViewDetails(guide._id.toString())}
                    >
                      View Details
                    </button>
                    <button
                      className={`px-3 py-1 rounded font-bold text-xs ${
                        guide.active 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={pending}
                      onClick={() => handleToggleActive(guide._id.toString(), guide.active)}
                    >
                      {pending ? 'Updating...' : (guide.active ? 'Deactivate' : 'Activate')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 