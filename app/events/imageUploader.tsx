import React, { useState, useEffect, forwardRef, ChangeEvent, ForwardedRef } from 'react';

interface FormImageUploaderProps {
  name: string;
  label?: string;
  onChange?: (file: File | null) => void;
  value?: File | string | null;
  error?: string;
  required?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string;
  className?: string;
}

const FormImageUploader = forwardRef<HTMLInputElement, FormImageUploaderProps>((
  { 
    name, 
    label = 'Upload Image', 
    onChange, 
    value, 
    error, 
    required = false,
    maxSizeMB = 5,
    acceptedFormats = "image/*",
    className = ""
  }, 
  ref: ForwardedRef<HTMLInputElement>
) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Handle initial value if provided
  useEffect(() => {
    if (value instanceof File) {
      setPreviewUrl(URL.createObjectURL(value));
    } else if (typeof value === 'string' && value) {
      // For when a URL is provided as initial value
      setPreviewUrl(value);
    }
  }, []);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    // Check file size (convert maxSizeMB to bytes)
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    
    return null;
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFileError(null);
    
    if (files && files.length > 0) {
      const file = files[0];
      const error = validateFile(file);
      
      if (error) {
        setFileError(error);
        return;
      }
      
      // Clean up previous preview if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create a URL for the preview
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Pass the file to parent form
      if (onChange) {
        onChange(file);
      }
    }
  };

  const handleRemove = (): void => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
    setFileError(null);
    
    // Pass null to parent form to clear the value
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`form-control ${className}`}>
      {/* {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )} */}
      
      <div className="mt-1 flex flex-col items-center">
        {!previewUrl ? (
          <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="space-y-2">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 48 48" 
                aria-hidden="true"
              >
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label 
                  htmlFor={`image-upload-${name}`} 
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id={`image-upload-${name}`}
                    name={name}
                    type="file"
                    accept={acceptedFormats}
                    onChange={handleImageChange}
                    ref={ref}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full border rounded-md overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
              aria-label="Remove image"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {(fileError || error) && (
          <p className="mt-2 text-sm text-red-600">
            {fileError || error}
          </p>
        )}
      </div>
    </div>
  );
});

export default FormImageUploader;