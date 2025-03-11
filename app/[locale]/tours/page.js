import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import ToursClientPage from './ToursClientPage';

export const metadata = {
  title: 'Tours | Tourminded',
  description: 'Explore our curated tours led by expert local guides',
};

async function getTours(searchParams) {
  try {
    await connectDB();
    
    // Build query based on search params
    const query = { isActive: true };
    
    // Filter by expertise if provided
    if (searchParams?.expertise) {
      query.expertise = searchParams.expertise;
    }
    
    // Filter by travelers (maxGroupSize) if provided
    if (searchParams?.travelers && !isNaN(parseInt(searchParams.travelers))) {
      const travelers = parseInt(searchParams.travelers);
      query.maxGroupSize = { $gte: travelers };
    }
    
    // Filter by date if provided
    if (searchParams?.date) {
      console.log(`Filtering by date: ${searchParams.date}`);
      // Implement date filtering logic based on your booking system
    }
    
    // Filter by languages if provided
    if (searchParams?.languages) {
      const languagesArray = searchParams.languages.split(',');
      query.languages = { $in: languagesArray };
    }
    
    // Filter by locations if provided
    if (searchParams?.locations) {
      const locationsArray = searchParams.locations.split(',');
      query.locationNames = { $in: locationsArray };
    }
    
    // Filter by activity level if provided
    if (searchParams?.activityLevel) {
      query.activityLevel = searchParams.activityLevel;
    }
    
    // Filter by accessibility options
    if (searchParams?.handicappedFriendly === 'true') {
      query.handicappedFriendly = true;
    }
    
    if (searchParams?.kidFriendly === 'true') {
      query.kidFriendly = true;
    }
    
    console.log('Tour query:', query);
    
    // Get filtered tours
    const tours = await Tour.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    return JSON.parse(JSON.stringify(tours));
  } catch (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
}

// Function to get all available filter options
async function getFilterOptions() {
  try {
    await connectDB();
    
    // Get unique values for each filter
    const expertiseValues = await Tour.distinct('expertise');
    const languageValues = await Tour.distinct('languages');
    const locationValues = await Tour.distinct('locationNames');
    const activityLevelValues = await Tour.distinct('activityLevel');
    
    return {
      expertise: expertiseValues,
      languages: languageValues,
      locations: locationValues,
      activityLevels: activityLevelValues
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      expertise: [],
      languages: [],
      locations: [],
      activityLevels: []
    };
  }
}

export default async function ToursPage({ params, searchParams }) {
  const { locale } = await params;
  
  // Await searchParams to fix the error
  searchParams = await searchParams;
  
  // Fetch tours and filter options in parallel
  const [tours, filterOptions] = await Promise.all([
    getTours(searchParams),
    getFilterOptions()
  ]);
  
  // Check if filters are applied
  const isFiltered = !!(
    searchParams.date || 
    searchParams.travelers || 
    searchParams.expertise || 
    searchParams.languages || 
    searchParams.locations || 
    searchParams.activityLevel || 
    searchParams.handicappedFriendly || 
    searchParams.kidFriendly
  );
  
  // Format filter display values
  const filterValues = {
    date: searchParams.date ? new Date(searchParams.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA') : null,
    travelers: searchParams.travelers || null,
    expertise: searchParams.expertise || null,
    languages: searchParams.languages ? searchParams.languages.split(',') : null,
    locations: searchParams.locations ? searchParams.locations.split(',') : null,
    activityLevel: searchParams.activityLevel || null,
    handicappedFriendly: searchParams.handicappedFriendly === 'true' || null,
    kidFriendly: searchParams.kidFriendly === 'true' || null
  };
  
  return (
    <ToursClientPage 
      initialTours={tours}
      filterOptions={filterOptions}
      locale={locale}
      isFiltered={isFiltered}
      filterValues={filterValues}
    />
  );
} 