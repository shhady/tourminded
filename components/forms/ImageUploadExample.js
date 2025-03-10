'use client';

import React, { useState } from 'react';
import ImageUploader from '../ui/ImageUploader';

const ImageUploadExample = ({ locale }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageData, setImageData] = useState(null);

  const handleImageUploaded = (url, data) => {
    setImageUrl(url);
    setImageData(data);
    console.log('Image uploaded:', url);
    console.log('Image data:', data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {locale === 'en' ? 'Image Upload Example' : 'مثال على تحميل الصور'}
      </h2>
      
      <ImageUploader
        onImageUploaded={handleImageUploaded}
        folder="tourminded/examples"
        uploadPreset="tourminded_preset"
        label={locale === 'en' ? 'Upload Image' : 'تحميل صورة'}
      />
      
      {imageUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            {locale === 'en' ? 'Uploaded Image' : 'الصورة المحملة'}
          </h3>
          <div className="border rounded-md p-4">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="w-full h-auto rounded-md"
            />
            <p className="mt-2 text-sm text-secondary-700 break-all">
              {imageUrl}
            </p>
          </div>
        </div>
      )}
      
      {imageData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            {locale === 'en' ? 'Image Details' : 'تفاصيل الصورة'}
          </h3>
          <div className="border rounded-md p-4 bg-gray-50">
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(imageData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadExample; 