"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { BASE_URL } from "@/app/api/constants";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OrganizationPicture {
  _id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

interface PictureGalleryProps {
  organizationId: string;
  canEditOrg?: boolean;
  refreshTrigger?: number;
}

const PictureGallery = ({
  organizationId,
  canEditOrg = false,
  refreshTrigger = 0,
}: PictureGalleryProps) => {
  const [pictures, setPictures] = useState<OrganizationPicture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPicture, setSelectedPicture] =
    useState<OrganizationPicture | null>(null);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>(
    {},
  );

  const fetchPictures = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/organizations/${organizationId}/pictures`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pictures");
      }

      const data = await response.json();
      setPictures(data.pictures || []);
    } catch (error) {
      console.error("Error fetching pictures:", error);
      toast.error("Failed to load organization pictures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, [organizationId, refreshTrigger]);

  const handleDeletePicture = async (pictureId: string) => {
    if (!confirm("Are you sure you want to delete this picture?")) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/organizations/${organizationId}/pictures/${pictureId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete picture");
      }

      toast.success("Picture deleted successfully");
      setPictures(pictures.filter((pic) => pic._id !== pictureId));
      if (selectedPicture?._id === pictureId) {
        setSelectedPicture(null);
      }
    } catch (error) {
      console.error("Error deleting picture:", error);
      toast.error("Failed to delete picture");
    }
  };

  const handleImageLoad = (id: string) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-full h-60 md:h-72 bg-gray-200 rounded-md animate-pulse"
            />
          ))}
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pictures uploaded yet.
      </div>
    );
  }

  // Distribute pictures into columns for masonry layout
  const getColumnPictures = () => {
    const columns = {
      col1: [] as OrganizationPicture[],
      col2: [] as OrganizationPicture[],
      col3: [] as OrganizationPicture[],
    };

    // Sort by creation date (newest first) to ensure consistent column distribution
    const sortedPictures = [...pictures].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    sortedPictures.forEach((picture, index) => {
      if (index % 3 === 0) columns.col1.push(picture);
      else if (index % 3 === 1) columns.col2.push(picture);
      else columns.col3.push(picture);
    });

    return columns;
  };

  const { col1, col2, col3 } = getColumnPictures();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          {col1.map((picture) => (
            <MasonryItem
              key={picture._id}
              picture={picture}
              canEditOrg={canEditOrg}
              onDelete={handleDeletePicture}
              onSelect={() => setSelectedPicture(picture)}
              onLoad={() => handleImageLoad(picture._id)}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          {col2.map((picture) => (
            <MasonryItem
              key={picture._id}
              picture={picture}
              canEditOrg={canEditOrg}
              onDelete={handleDeletePicture}
              onSelect={() => setSelectedPicture(picture)}
              onLoad={() => handleImageLoad(picture._id)}
            />
          ))}
        </div>

        {/* Column 3 - Only show on md+ screens */}
        <div className="hidden md:flex flex-col gap-4">
          {col3.map((picture) => (
            <MasonryItem
              key={picture._id}
              picture={picture}
              canEditOrg={canEditOrg}
              onDelete={handleDeletePicture}
              onSelect={() => setSelectedPicture(picture)}
              onLoad={() => handleImageLoad(picture._id)}
            />
          ))}
        </div>
      </div>

      {selectedPicture && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPicture(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <div className="relative">
              <Image
                src={selectedPicture.imageUrl}
                alt={selectedPicture.caption || "Organization picture"}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh] max-w-full"
                onClick={(e) => e.stopPropagation()}
                priority
              />
              {selectedPicture.caption && (
                <div className="p-4 bg-black/50 text-white absolute bottom-0 left-0 right-0">
                  {selectedPicture.caption}
                </div>
              )}
            </div>
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-black p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPicture(null);
              }}
              aria-label="Close image preview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual masonry item
interface MasonryItemProps {
  picture: OrganizationPicture;
  canEditOrg: boolean;
  onDelete: (id: string) => void;
  onSelect: () => void;
  onLoad: () => void;
}

const MasonryItem = ({
  picture,
  canEditOrg,
  onDelete,
  onSelect,
  onLoad,
}: MasonryItemProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Pre-load the image to get its natural dimensions for proper sizing
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
      onLoad();
    };
    img.src = picture.imageUrl;
  }, [picture.imageUrl, onLoad]);

  return (
    <div
      className="group relative rounded-md overflow-hidden border border-gray-200 cursor-pointer transition-all hover:shadow-md"
      onClick={onSelect}
      style={{
        // Only apply a minimum height, the width is controlled by the grid
        minHeight: "200px",
      }}
    >
      <div className="w-full h-full relative">
        <div
          className={`relative w-full ${!aspectRatio ? "bg-gray-100 animate-pulse" : ""}`}
        >
          <Image
            ref={imgRef}
            src={picture.imageUrl}
            alt={picture.caption || "Organization picture"}
            width={800}
            height={aspectRatio ? 800 / aspectRatio : 600}
            className="w-full object-cover"
            onLoad={() => onLoad()}
          />
        </div>
      </div>

      {picture.caption && (
        <div className="p-2 bg-black/50 text-white text-sm absolute bottom-0 left-0 right-0">
          {picture.caption}
        </div>
      )}

      {canEditOrg && (
        <button
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(picture._id);
          }}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default PictureGallery;
