import React from 'react';

export interface ImgProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  /** Absolutely fill the nearest positioned ancestor (parity with next/image `fill`). */
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
}

/**
 * Lightweight drop-in replacement for next/image.
 * Renders a native <img> with sensible loading defaults.
 */
export default function Img({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  quality: _quality,
  unoptimized: _unoptimized,
  sizes,
  style,
  ...rest
}: ImgProps) {
  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }
    : {};

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}
