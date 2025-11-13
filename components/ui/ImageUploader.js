'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader, Check, X } from 'lucide-react';
import Image from 'next/image';

const ImageUploader = ({ 
  onImageUploaded, 
  folder = 'tourminded', 
  uploadPreset = 'boulos',
  label,
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  showPreview = true,
  resetAfterUpload = false
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [cloudName, setCloudName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Get cloud name from environment variable
    setCloudName(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds the maximum allowed size (${maxSize / (1024 * 1024)}MB)`);
      return;
    }

    // Create preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);
      
      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured');
      }
      
      // Get signed upload parameters from our API
      const signatureResponse = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder,
          fileType: file.type,
        }),
      });
      
      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json();
        throw new Error(`Failed to get upload signature: ${errorData.message || signatureResponse.statusText}`);
      }
      
      const { signature, timestamp, apiKey } = await signatureResponse.json();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.response);
          onImageUploaded(data.secure_url, data);
          setUploadProgress(0);
          setIsUploading(false);
          if (resetAfterUpload) {
            setPreview('');
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.response);
          throw new Error('Upload failed: ' + xhr.status);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        console.error('XHR error:', xhr);
        throw new Error('Upload failed: Network error');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading image: ' + error.message);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="mt-1 flex items-center">
        <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary-500 focus:outline-none">
          <input
            type="file"
            ref={inputRef}
            className="absolute inset-0 z-50 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept={accept}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="pt-2 text-sm text-secondary-700">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full h-full">
                <Image 
                  src={preview} 
                  alt="Preview" 
                  width={100}
                  height={100}
                  className="object-contain w-full h-full max-h-24"
                />
                <div className="absolute top-0 right-0 p-1 bg-green-100 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="pt-2 text-sm text-secondary-700">Image uploaded successfully</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-secondary-400" />
              <p className="pt-2 text-sm text-secondary-700">
                Drag & drop an image here or click to browse
              </p>
            </div>
          )}
        </label>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-error-600">
          <X className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 