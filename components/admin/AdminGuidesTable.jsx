"use client";
import React, { useTransition, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MessageCircle, Users } from "lucide-react";

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
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-8 text-secondary-700">Welcome, {adminName}! Here you can manage guides who applied to become a guide.</p>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Guides Management</h2>
          </div>
          <p className="text-gray-600 mb-4">Manage guide applications and status</p>
          <p className="text-sm text-green-600 font-medium">You're currently viewing this section</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">User Messages</h2>
          </div>
          <p className="text-gray-600 mb-4">View all conversations between users</p>
          <button
            onClick={() => {
              const locale = params?.locale || 'en';
              router.push(`/${locale}/dashboard/admin/messages`);
            }}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            View Messages
          </button>
        </div>
      </div>
      
      {error && <div className="mb-4 text-red-600">{error}</div>}
      
      {/* Guides: Mobile Cards */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Guide Applications</h2>
        </div>
        {/* Mobile view */}
        <div className="px-6 py-4 space-y-4 md:hidden">
          {guides.map((guide) => (
            <div key={guide._id} className="border border-gray-200 rounded-lg p-4 shadow-sm text-secondary-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-black">{guide.names?.[0]?.value || 'N/A'}</h3>
                  <p className="text-sm text-black">{guide.user?.email || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${guide.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {guide.active ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
                  onClick={() => handleViewDetails(guide._id.toString())}
                >
                  View Details
                </button>
                <button
                  className={`px-3 py-2 rounded text-white text-sm font-medium ${guide.active ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={pending}
                  onClick={() => handleToggleActive(guide._id.toString(), guide.active)}
                >
                  {pending ? 'Updating...' : (guide.active ? 'Deactivate' : 'Activate')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="overflow-x-auto hidden md:block">
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
                  <td className="px-4 py-2 text-black">{guide.names?.[0]?.value || 'N/A'}</td>
                  <td className="px-4 py-2 text-black">{guide.user?.email || 'N/A'}</td>
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
    </div>
  );
} 