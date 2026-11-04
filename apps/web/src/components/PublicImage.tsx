import React from 'react';

export function PublicImage({ fallbackSrc = '/public-wedding-hero.jpg', loading = 'lazy', ...props }:
  React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  return <img {...props} loading={loading} decoding="async" onError={event => {
    props.onError?.(event);
    const image = event.currentTarget;
    if (image.src === new URL(fallbackSrc, window.location.href).href) return;
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackSrc;
  }} />;
}
