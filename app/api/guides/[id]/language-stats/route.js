import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guide from '@/models/Guide';

// Helper function to calculate average proficiency
const calculateAverageProficiency = (proficiency) => {
  if (!Array.isArray(proficiency) || proficiency.length === 0) {
    return { average: 0, count: 0 };
  }
  
  // Handle new format with userId and rating
  if (proficiency[0] && typeof proficiency[0] === 'object' && proficiency[0].rating !== undefined) {
    const validRatings = proficiency.filter(item => item.rating !== undefined);
    if (validRatings.length === 0) return { average: 0, count: 0 };
    
    const sum = validRatings.reduce((acc, item) => acc + item.rating, 0);
    return {
      average: parseFloat((sum / validRatings.length).toFixed(1)),
      count: validRatings.length
    };
  }
  
  // Handle old format (numbers only) - should be cleaned up by update-proficiency route
  if (typeof proficiency[0] === 'number') {
    const sum = proficiency.reduce((acc, rating) => acc + rating, 0);
    return {
      average: parseFloat((sum / proficiency.length).toFixed(1)),
      count: proficiency.length
    };
  }
  
  return { average: 0, count: 0 };
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    await connectDB();
    
    // Find guide by ID
    const guide = await Guide.findById(id)
      .select('languages')
      .lean(); // Use lean() for better performance since we only need data
    
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    
    // Calculate averages for each language
    const languageStats = guide.languages.map(lang => {
      const stats = calculateAverageProficiency(lang.proficiency);
      return {
        language: lang.language,
        average: stats.average,
        count: stats.count,
        stars: Math.round(stats.average) // For displaying filled stars
      };
    });
    
    return NextResponse.json({ 
      success: true,
      languages: languageStats 
    });
    
  } catch (error) {
    console.error('Error fetching language stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch language statistics' 
    }, { status: 500 });
  }
}