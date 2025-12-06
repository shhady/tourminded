'use client';

import React, { useState, useEffect } from 'react';

const TravelerCounter = ({ onChange, locale }) => {
  const [counts, setCounts] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0
  });
  const [serviceAnimal, setServiceAnimal] = useState(false);

  // Calculate total travelers (including pets)
  const calculateTotal = (updatedCounts) => {
    return updatedCounts.adults + updatedCounts.children + updatedCounts.infants + updatedCounts.pets;
  };

  // Sync parent whenever traveler counts or service animal flag change
  useEffect(() => {
    const total = calculateTotal(counts);
    onChange(total, counts, serviceAnimal);
  }, [counts, serviceAnimal, onChange]);

  const handleIncrement = (type) => {
    const newCounts = { ...counts };
    newCounts[type] += 1;
    setCounts(newCounts);
  };

  const handleDecrement = (type) => {
    if (counts[type] <= 0) return;
    
    // Ensure at least one adult
    if (type === 'adults' && counts.adults <= 1) return;
    
    const newCounts = { ...counts };
    newCounts[type] -= 1;
    setCounts(newCounts);
  };
  
  const handleServiceAnimalChange = (e) => {
    const checked = e.target.checked;
    setServiceAnimal(checked);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full p-4 border border-gray-200">
      {/* Adults */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium text-gray-800">
              {locale === 'en' ? 'Adults' : 'البالغين'}
            </h3>
            <p className="text-xs text-gray-500">
              {locale === 'en' ? 'Ages 13 or above' : 'الأعمار 13 وما فوق'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleDecrement('adults')}
              disabled={counts.adults <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                counts.adults <= 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label={locale === 'en' ? 'Decrease adults' : 'إنقاص البالغين'}
            >
              <span className="text-xl font-medium">−</span>
            </button>
            <span className="w-6 text-center font-medium text-gray-700">{counts.adults}</span>
            <button
              type="button"
              onClick={() => handleIncrement('adults')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
              aria-label={locale === 'en' ? 'Increase adults' : 'زيادة البالغين'}
            >
              <span className="text-xl font-medium">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Children */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium text-gray-800">
              {locale === 'en' ? 'Children' : 'الأطفال'}
            </h3>
            <p className="text-xs text-gray-500">
              {locale === 'en' ? 'Ages 2-12' : 'الأعمار 2-12'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleDecrement('children')}
              disabled={counts.children <= 0}
              className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                counts.children <= 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label={locale === 'en' ? 'Decrease children' : 'إنقاص الأطفال'}
            >
              <span className="text-xl font-medium">−</span>
            </button>
            <span className="w-6 text-center font-medium text-gray-700">{counts.children}</span>
            <button
              type="button"
              onClick={() => handleIncrement('children')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
              aria-label={locale === 'en' ? 'Increase children' : 'زيادة الأطفال'}
            >
              <span className="text-xl font-medium">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Infants */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium text-gray-800">
              {locale === 'en' ? 'Infants' : 'الرضع'}
            </h3>
            <p className="text-xs text-gray-500">
              {locale === 'en' ? 'Under 2 years' : 'أقل من سنتين'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleDecrement('infants')}
              disabled={counts.infants <= 0}
              className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                counts.infants <= 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label={locale === 'en' ? 'Decrease infants' : 'إنقاص الرضع'}
            >
              <span className="text-xl font-medium">−</span>
            </button>
            <span className="w-6 text-center font-medium text-gray-700">{counts.infants}</span>
            <button
              type="button"
              onClick={() => handleIncrement('infants')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
              aria-label={locale === 'en' ? 'Increase infants' : 'زيادة الرضع'}
            >
              <span className="text-xl font-medium">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Pets */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium text-gray-800">
              {locale === 'en' ? 'Pets' : 'الحيوانات الأليفة'}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleDecrement('pets')}
              disabled={counts.pets <= 0}
              className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                counts.pets <= 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label={locale === 'en' ? 'Decrease pets' : 'إنقاص الحيوانات الأليفة'}
            >
              <span className="text-xl font-medium">−</span>
            </button>
            <span className="w-6 text-center font-medium text-gray-700">{counts.pets}</span>
            <button
              type="button"
              onClick={() => handleIncrement('pets')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50"
              aria-label={locale === 'en' ? 'Increase pets' : 'زيادة الحيوانات الأليفة'}
            >
              <span className="text-xl font-medium">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Service animal */}
      <div className="py-3">
        <div className="flex items-center">
          <input
            id="service-animal"
            type="checkbox"
            checked={serviceAnimal}
            onChange={handleServiceAnimalChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="service-animal" className="ml-2 block text-sm text-gray-800">
            {locale === 'en' ? 'Bringing a service animal' : 'هل تصطحب حيوانًا للخدمة'}
          </label>
        </div>
      </div>
      
      {/* Hidden input to store the total */}
      <input 
        type="hidden" 
        value={calculateTotal(counts)} 
      />
    </div>
  );
};

export default TravelerCounter; 