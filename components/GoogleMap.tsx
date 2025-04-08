"use client";
import React from "react";

interface GoogleMapProps {
  location: string;
  apiKey?: string;
  height?: string;
  width?: string;
}

export default function GoogleMap({
  location,
  apiKey,
  height = "100%",
  width = "100%",
}: GoogleMapProps) {
  // URL encode the location for the query parameter
  const encodedLocation = encodeURIComponent(location);

  // Create the Google Maps embed URL
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedLocation}`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}`;

  return (
    <div className="rounded-lg overflow-hidden" style={{ height, width }}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={`Map showing location: ${location}`}
      ></iframe>
    </div>
  );
}
