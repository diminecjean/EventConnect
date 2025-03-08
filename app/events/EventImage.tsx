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
    <div className="flex h-64 w-64 rounded-lg items-center justify-center overflow-hidden relative">
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={256}
          height={256}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center text-center bg-violet-200 text-violet-700 text-xl font-bold">
          {title}
        </div>
      )}
    </div>
  );
}
