'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  overlay?: boolean;
  className?: string;
}

export default function VideoBackground({
  src,
  poster,
  overlay = true,
  className = '',
}: VideoBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="absolute top-0 left-0 h-full w-full object-cover"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {overlay && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      )}
    </div>
  );
}
