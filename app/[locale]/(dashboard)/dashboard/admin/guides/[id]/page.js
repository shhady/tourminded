import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import Link from 'next/link';
import ToggleActiveButton from './ToggleActiveButton';

export const metadata = {
  title: 'Guide Details | Admin Dashboard',
  description: 'View detailed information about a guide',
};

export default async function GuideDetailsPage({ params }) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
    return;
  }

  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  await connectDB();
  const user = await User.findOne({ clerkId: clerkUser.id });
  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
    return;
  }

  const { id } = await params;
  const guide = await Guide.findById(id).populate('user');
  
  if (!guide) {
    redirect(`/${locale}/dashboard/admin`);
    return;
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="mb-6">
        <Link 
          href={`/${locale}/dashboard/admin`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Guide Details</h1>
        <ToggleActiveButton guideId={guide._id.toString()} currentActive={guide.active} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Guide ID</label>
                <p className="text-gray-900 text-sm">{guide._id.toString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">User ID</label>
                <p className="text-gray-900 text-sm">{guide.user?._id?.toString() || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{guide.names?.[0]?.value || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nickname</label>
                <p className="text-gray-900">{guide.nickname || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{guide.user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{guide.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{guide.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  guide.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {guide.active ? 'Active' : 'Pending'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Rating</label>
                <p className="text-gray-900">{guide.rating || 0}/5 ({guide.reviewCount || 0} reviews)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Years of Experience</label>
                <p className="text-gray-900">{guide.yearsOfExperience || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">
                  {guide.createdAt ? new Date(guide.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Images</h2>
            <div className="space-y-4">
              {guide.profileImage?.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Profile Image</label>
                  <img 
                    src={guide.profileImage.url} 
                    alt="Profile" 
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
              {guide.coverImage?.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Cover Image</label>
                  <img 
                    src={guide.coverImage.url} 
                    alt="Cover" 
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          {/* Names in Different Languages */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Names in Different Languages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guide.names?.map((name, index) => (
                <div key={index} className="border rounded p-3">
                  <label className="block text-sm font-medium text-gray-600">{name.language}</label>
                  <p className="text-gray-900">{name.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Languages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guide.languages?.map((lang, index) => (
                <div key={index} className="border rounded p-3">
                  <label className="block text-sm font-medium text-gray-600">{lang.language}</label>
                  <p className="text-gray-900">Proficiency: {lang.proficiency}/5</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Expertise Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guide.expertise?.map((exp, index) => (
                <div key={index} className="border rounded p-3">
                  <label className="block text-sm font-medium text-gray-600">{exp.area}</label>
                  <p className="text-gray-900 text-sm">
                    License: {exp.licenseIssueDate ? new Date(exp.licenseIssueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* About Sections */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">About Sections</h2>
            <div className="space-y-4">
              {guide.aboutSections?.map((about, index) => (
                <div key={index} className="border rounded p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">{about.language}</label>
                  <p className="text-gray-900 text-sm leading-relaxed">{about.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Information */}
          {guide.vehicle && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900">{guide.vehicle.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Model</label>
                  <p className="text-gray-900">{guide.vehicle.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Year</label>
                  <p className="text-gray-900">{guide.vehicle.year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Capacity</label>
                  <p className="text-gray-900">{guide.vehicle.capacity} passengers</p>
                </div>
                {guide.vehicle.image?.url && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Vehicle Image</label>
                    <img 
                      src={guide.vehicle.image.url} 
                      alt="Vehicle" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google Calendar Integration */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Google Calendar Integration</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Calendar Connected</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  guide.googleCalendar?.accessToken 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {guide.googleCalendar?.accessToken ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              {guide.googleCalendar?.accessToken && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Calendar ID</label>
                    <p className="text-gray-900">{guide.googleCalendar.calendarId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Token Expiry</label>
                    <p className="text-gray-900">
                      {guide.googleCalendar.tokenExpiry ? 
                        new Date(guide.googleCalendar.tokenExpiry).toLocaleString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data (for debugging) */}
      <div className="mt-8">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
            Raw Data (Click to expand)
          </summary>
          <div className="mt-2 p-4 bg-gray-50 rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(guide, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
} 