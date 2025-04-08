import React, {
  useState,
  useEffect,
  forwardRef,
  ChangeEvent,
  ForwardedRef,
} from "react";

interface FormImageUploaderProps {
  name: string;
  label?: string;
  onChange?: (file: File | string | null) => void;
  value?: File | string | null;
  error?: string;
  required?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  scaleDesc?: string;
  previewUrl?: string;
}

const FormImageUploader = forwardRef<HTMLInputElement, FormImageUploaderProps>(
  (
    {
      name,
      label = "Upload Image",
      onChange,
      value,
      error,
      required = false,
      maxSizeMB = 5,
      acceptedFormats = "image/*",
      className = "",
      width = "100%",
      height = "auto",
      scaleDesc = "",
      previewUrl,
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [fileObject, setFileObject] = useState<File | null>(null);

    // Handle previewUrl if provided
    useEffect(() => {
      if (previewUrl) {
        setPreview(previewUrl);
      }
    }, [previewUrl]);

    // Handle initial value if provided
    useEffect(() => {
      if (value instanceof File) {
        setFileObject(value);
        const newUrl = URL.createObjectURL(value);
        setPreview(newUrl);
        console.log("Created object URL from File:", newUrl);
      } else if (typeof value === "string" && value) {
        setPreview(value);
        console.log("Set preview from string value:", value);
      } else if (value === null) {
        setPreview(null);
        setFileObject(null);
        console.log("Cleared preview");
      }
    }, [value]);

    // Clean up object URL when component unmounts
    useEffect(() => {
      return () => {
        if (typeof preview === "string" && preview?.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
          console.log("Revoked URL:", preview);
        }
      };
    }, [preview]);

    const validateFile = (file: File): string | null => {
      // Check file size (convert maxSizeMB to bytes)
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File size must be less than ${maxSizeMB}MB`;
      }

      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        return "File must be an image";
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
        if (typeof preview === "string" && preview?.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }

        // Create a URL for the preview
        const fileUrl = URL.createObjectURL(file);
        console.log("Created new preview URL:", fileUrl);
        setPreview(fileUrl);
        setFileObject(file);

        // Pass the file to parent form
        if (onChange) {
          onChange(file);
        }
      }
    };

    const handleRemove = (): void => {
      // Use type guard before calling startsWith
      if (typeof preview === "string" && preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setPreview(null);
      setFileError(null);
      setFileObject(null);

      // Pass null to parent form to clear the value
      if (onChange) {
        onChange(null);
      }
    };

    const containerStyle = {
      width,
      height: !preview ? height : "auto",
    };

    const imageStyle = {
      width: "100%",
      height: preview ? height : "auto",
      objectFit: "cover" as const,
    };

    console.log("Rendering with preview:", preview);

    return (
      <div className={`form-control ${className}`} style={{ width }}>
        <div className="mt-1 flex flex-col items-center">
          {!preview ? (
            <label
              htmlFor={`image-upload-${name}`}
              className="block border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors flex justify-center items-center"
              style={containerStyle}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
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
                  <div className="flex justify-center text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Upload a file
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG or JPG up to {maxSizeMB}MB
                  </p>
                  <p className="text-xs text-gray-500">{scaleDesc}</p>
                </div>
                <input
                  id={`image-upload-${name}`}
                  name={name}
                  type="file"
                  accept={acceptedFormats}
                  onChange={handleImageChange}
                  ref={ref}
                  className="sr-only"
                />
              </div>
            </label>
          ) : (
            <div
              className="relative border rounded-md overflow-hidden"
              style={{ width: "100%" }}
            >
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full"
                style={imageStyle}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                aria-label="Remove image"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {(fileError || error) && (
            <p className="mt-2 text-sm text-red-600">{fileError || error}</p>
          )}
        </div>
      </div>
    );
  },
);

// Add a display name
FormImageUploader.displayName = "FormImageUploader";

export default FormImageUploader;
