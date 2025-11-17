import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Guide from '@/models/Guide';
import Link from 'next/link';
import ToggleActiveButton from './ToggleActiveButton';

// Helper to safely extract image URL
function safeImage(img) {
  if (!img) return null;

  if (typeof img === "string") return { url: img };

  if (img.url && typeof img.url === "string") return { url: img.url };

  return null;
}

// Helper to convert ObjectId → string
function toStr(id) {
  try {
    return id?.toString() || null;
  } catch {
    return null;
  }
}

// Helper to convert to ISO string date
function toIsoDate(d) {
  try {
    if (!d) return null;
    const x = new Date(d);
    return isNaN(x.getTime()) ? null : x.toISOString();
  } catch {
    return null;
  }
}

// Sanitize simple arrays of subdocs into primitives-only objects
function sanitizeNames(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(n => ({
    language: typeof n?.language === 'string' ? n.language : '',
    value: typeof n?.value === 'string' ? n.value : ''
  }));
}

function sanitizeLanguages(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(l => ({
    language: typeof l?.language === 'string' ? l.language : '',
    proficiency: typeof l?.proficiency === 'number' ? l.proficiency : 0
  }));
}

function sanitizeExpertise(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(e => ({
    area: typeof e?.area === 'string' ? e.area : '',
    expertiseAreaDescriptionEn: typeof e?.expertiseAreaDescriptionEn === 'string' ? e.expertiseAreaDescriptionEn : null,
    expertiseAreaDescriptionAr: typeof e?.expertiseAreaDescriptionAr === 'string' ? e.expertiseAreaDescriptionAr : null
  }));
}

function sanitizeAboutSections(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(a => ({
    language: typeof a?.language === 'string' ? a.language : '',
    content: typeof a?.content === 'string' ? a.content : ''
  }));
}

function sanitizeVehicle(v) {
  if (!v || typeof v !== 'object') return null;
  return {
    type: typeof v.type === 'string' ? v.type : null,
    model: typeof v.model === 'string' ? v.model : null,
    year: typeof v.year === 'number' || typeof v.year === 'string' ? v.year : null,
    capacity: typeof v.capacity === 'number' || typeof v.capacity === 'string' ? v.capacity : null,
    image: safeImage(v.image)
  };
}

function sanitizeCalendar(gc) {
  if (!gc || typeof gc !== 'object') return null;
  return {
    accessToken: !!gc.accessToken,
    calendarId: typeof gc.calendarId === 'string' ? gc.calendarId : null,
    tokenExpiry: toIsoDate(gc.tokenExpiry)
  };
}

export const metadata = {
  title: 'Guide Details | Admin Dashboard',
  description: 'View detailed information about a guide',
};

export default async function GuideDetailsPage({ params }) {
  // SESSION
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const localeParams = await params;
    const locale = localeParams?.locale || 'en';
    redirect(`/${locale}/sign-in`);
  }

  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  await connectDB();

  // USER AUTH
  const user =
    (await User.findById(session.user.id)) ||
    (await User.findOne({ email: session.user.email }));

  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // GUIDE FETCH
  const { id } = await params;
  const guideRaw = await Guide.findById(id).populate('user').lean();

  // Debug logging to identify problematic fields
  console.log('[AdminGuideDetail] guideRaw keys:', Object.keys(guideRaw || {}));
  if (guideRaw?.reviews) {
    console.log('[AdminGuideDetail] reviews length:', Array.isArray(guideRaw.reviews) ? guideRaw.reviews.length : 'not-array');
    console.log('[AdminGuideDetail] sample review:', Array.isArray(guideRaw.reviews) && guideRaw.reviews[0] ? Object.keys(guideRaw.reviews[0]) : null);
  }
  console.log('[AdminGuideDetail] images:', { profileImage: guideRaw?.profileImage, coverImage: guideRaw?.coverImage });
  console.log('[AdminGuideDetail] vehicle.image:', guideRaw?.vehicle?.image);

  if (!guideRaw) {
    redirect(`/${locale}/dashboard/admin`);
  }

  // BUILD SAFE SERIALIZABLE GUIDE OBJECT
  const guide = {
    _id: toStr(guideRaw._id),

    user: guideRaw.user
      ? {
          _id: toStr(guideRaw.user._id),
          email: guideRaw.user.email || null,
        }
      : null,

    names: sanitizeNames(guideRaw.names),

    nickname: guideRaw.nickname || null,

    profileImage: safeImage(guideRaw.profileImage),

    coverImage: safeImage(guideRaw.coverImage),

    phone: guideRaw.phone || null,
    address: guideRaw.address || null,
    active: !!guideRaw.active,

    rating: typeof guideRaw.rating === 'number' ? guideRaw.rating : 0,
    reviewCount: typeof guideRaw.reviewCount === 'number' ? guideRaw.reviewCount : 0,

    licenseIssueDate: toIsoDate(guideRaw.licenseIssueDate),

    createdAt: toIsoDate(guideRaw.createdAt),

    languages: sanitizeLanguages(guideRaw.languages),

    expertise: sanitizeExpertise(guideRaw.expertise),

    aboutSections: sanitizeAboutSections(guideRaw.aboutSections),

    vehicle: sanitizeVehicle(guideRaw.vehicle),

    googleCalendar: sanitizeCalendar(guideRaw.googleCalendar),
  };

  // Final debug snapshot (truncated)
  try {
    const snapshot = JSON.stringify(guide).slice(0, 1200);
    console.log('[AdminGuideDetail] sanitized guide snapshot:', snapshot);
  } catch (e) {
    console.log('[AdminGuideDetail] JSON stringify failed:', e?.message);
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
        <ToggleActiveButton guideId={guide._id} currentActive={guide.active} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="space-y-3">

              <div>
                <label className="block text-sm font-medium text-gray-600">Guide ID</label>
                <p className="text-gray-900 text-sm">{guide._id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">User ID</label>
                <p className="text-gray-900 text-sm">
                  {guide.user?._id || 'N/A'}
                </p>
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
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    guide.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {guide.active ? 'Active' : 'Pending'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Rating</label>
                <p className="text-gray-900">
                  {guide.rating}/5 ({guide.reviewCount} reviews)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Years of Experience</label>
                <p className="text-gray-900">
                  {guide.licenseIssueDate
                    ? Math.floor(
                        (new Date() - new Date(guide.licenseIssueDate)) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )
                    : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">License Issue Date</label>
                <p className="text-gray-900">
                  {guide.licenseIssueDate
                    ? new Date(guide.licenseIssueDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">
                  {guide.createdAt
                    ? new Date(guide.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Images</h2>
            <div className="space-y-4">
              {guide.profileImage?.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Profile Image
                  </label>
                  <img
                    src={guide.profileImage.url}
                    alt="Profile"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}

              {guide.coverImage?.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Cover Image
                  </label>
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

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2">
          {/* Names */}
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
                  {exp.expertiseAreaDescriptionEn && (
                    <p className="text-gray-900 text-sm mt-1">
                      {exp.expertiseAreaDescriptionEn}
                    </p>
                  )}
                  {exp.expertiseAreaDescriptionAr && (
                    <p className="text-gray-900 text-sm mt-1">
                      {exp.expertiseAreaDescriptionAr}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">About Sections</h2>
            <div className="space-y-4">
              {guide.aboutSections?.map((about, index) => (
                <div key={index} className="border rounded p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {about.language}
                  </label>
                  <p className="text-gray-900 text-sm leading-relaxed">{about.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle */}
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
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Vehicle Image
                    </label>
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

          {/* Google Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Google Calendar Integration</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Calendar Connected</label>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    guide.googleCalendar?.accessToken
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
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
                      {guide.googleCalendar.tokenExpiry
                        ? new Date(guide.googleCalendar.tokenExpiry).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
