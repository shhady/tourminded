'use client';

import { useState } from 'react';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteTourButton({ tourId, locale }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(locale === 'en' 
      ? 'Are you sure you want to delete this tour? This action cannot be undone.'
      : 'هل أنت متأكد أنك تريد حذف هذه الجولة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/tours/${tourId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh the page to show updated list
          router.refresh();
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete tour');
        }
      } catch (error) {
        console.error('Error deleting tour:', error);
        alert('An error occurred while deleting the tour');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
      onClick={handleDelete}
      disabled={isDeleting}
      title={locale === 'en' ? 'Delete Tour' : 'حذف الجولة'}
    >
      <Trash className="h-5 w-5" />
    </button>
  );
} 