"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const current = Math.min(Math.max(index, 0), Math.max(total - 1, 0));

  return (
    <div className="gallery">
      <div className="gallery__main">
        {total > 0 ? (
          <img
            src={images[current]}
            alt={alt}
            loading="eager"
            decoding="async"
          />
        ) : null}
      </div>
      {total > 1 ? (
        <div className="gallery__thumbs" role="tablist" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={"gallery__thumb" + (i === current ? " is-active" : "")}
              role="tab"
              aria-selected={i === current}
              aria-label={`View photo ${i + 1} of ${total}`}
              onClick={() => setIndex(i)}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
