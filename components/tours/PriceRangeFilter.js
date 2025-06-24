'use client';

import React from 'react';

export default function PriceRangeFilter({ 
  locale, 
  options, 
  defaultValue,
  minPriceValue,
  maxPriceValue
}) {
  const handlePriceRangeChange = (e) => {
    const range = e.target.value.split('-');
    
    // Find the min and max price d input elements and update their values
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (minPriceInput) minPriceInput.value = range[0] || '';
    if (maxPriceInput) maxPriceInput.value = range[1] || '';
  };
  
  return (
    <div>
      <label htmlFor="priceRange" className="block text-sm font-medium text-secondary-700 mb-1">
        {locale === 'en' ? 'Price Range' : 'نطاق السعر'}
      </label>
      <select
        id="priceRange"
        name="priceRange"
        defaultValue={defaultValue || ''}
        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        onChange={handlePriceRangeChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input 
        type="hidden" 
        id="minPrice" 
        name="minPrice" 
        defaultValue={minPriceValue || ''} 
      />
      <input 
        type="hidden" 
        id="maxPrice" 
        name="maxPrice" 
        defaultValue={maxPriceValue || ''} 
      />
    </div>
  );
} 