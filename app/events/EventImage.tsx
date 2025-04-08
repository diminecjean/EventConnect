"use client";
import Image from "next/image";
import * as React from "react";

type EventImageProps = {
  src: string;
  alt: string;
  title: string;
};

export default function EventImage({ src, alt, title }: EventImageProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="relative aspect-square w-64 rounded-lg overflow-hidden">
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="256px"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-violet-200 text-violet-700 text-xl font-bold p-4">
          {title}
        </div>
      )}
    </div>
  );
}
