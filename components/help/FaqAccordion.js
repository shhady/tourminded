 'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items, locale }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <FaqItem 
          key={index}
          question={item.question}
          answer={item.answer}
          locale={locale}
        />
      ))}
    </div>
  );
}

function FaqItem({ question, answer, locale }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-lg text-secondary-900">{question}</h3>
        <ChevronDown 
          className={`text-secondary-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <div className="prose prose-sm max-w-none text-secondary-700">
            {answer.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}