'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Languages, Award, ChevronRight, User } from 'lucide-react';

// If you have a GuideCard component, add this function at the top
const calculateYearsOfExperience = (licenseDate) => {
  if (!licenseDate) return 0;
  
  const licenseYear = new Date(licenseDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - licenseYear);
};

export default function GuideCard({ guide, locale }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Safely extract name
  const name = guide.name?.[locale] || guide.name?.en || guide.name || 'Guide';
  
  // Safely extract bio
  const bio = guide.about?.[locale] || guide.about?.en || '';
  
  // Get profile image URL safely
  const imageUrl = guide.profileImage?.url || '';
  
  return (
    <div 
      className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
      
      {/* Guide image */}
      <div className="relative h-96 w-full overflow-hidden">
        {imageUrl ? (
          <div className="relative h-full w-full">
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
            <User className="text-white h-16 w-16" />
          </div>
        )}
      </div>
      
      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 text-white">
        {/* Guide name and rating */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold tracking-tight drop-shadow-md">{name}</h2>
          {guide.rating > 0 ? (
            <div className="flex items-center bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-full shadow-md">
              <Star className="w-4 h-4 mr-1 text-yellow-700" />
              <span className="font-bold">{guide.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>
        
        {/* Location */}
        <div className="flex items-center mb-3 text-white/90">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-primary-300" />
          <span className="text-sm font-medium">{guide.address || 'Israel'}</span>
        </div>
        
        {/* Bio */}
        <p className="text-sm text-white/85 mb-4 line-clamp-2 transition-all duration-300 group-hover:line-clamp-3 drop-shadow-sm">
          {bio || 'Professional local guide'}
        </p>
        
        {/* Expertise and languages */}
        <div className="flex flex-wrap gap-2 mb-5">
          {guide.expertise && guide.expertise.length > 0 && (
            <span className="bg-primary-500/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm backdrop-blur-sm">
              <Award className="w-3 h-3 mr-1.5 text-primary-200" />
              {guide.expertise[0].area}
            </span>
          )}
          
          {guide.languages && guide.languages.length > 0 && (
            <span className="bg-secondary-500/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm backdrop-blur-sm">
              <Languages className="w-3 h-3 mr-1.5 text-secondary-200" />
              {guide.languages.map(l => l.language).join(', ')}
            </span>
          )}
        </div>
        
        {/* Add years of experience */}
        {guide.expertise && guide.expertise.length > 0 && guide.expertise[0].licenseIssueDate && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">
              {calculateYearsOfExperience(guide.expertise[0].licenseIssueDate)}
            </span>
            <span className="ml-1">
              {locale === 'en' 
                ? 'years of experience' 
                : 'سنوات من الخبرة'}
            </span>
          </div>
        )}
        
        {/* View profile button */}
        <Link 
          href={`/${locale}/guides/${guide._id}`}
          className="cursor-pointer inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
        >
          {locale === 'en' 
            ? 'View Profile' 
            : 'عرض الملف الشخصي'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
