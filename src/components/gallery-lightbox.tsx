"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";

export type GalleryLightboxImage = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
};

type GalleryTileProps = {
  image: GalleryLightboxImage;
  images: GalleryLightboxImage[];
  children: ReactNode;
  className?: string;
};

export function GalleryLightboxTile({ image, images, children, className }: GalleryTileProps) {
  const [activeImage, setActiveImage] = useState<GalleryLightboxImage | null>(null);
  const activeIndex = useMemo(
    () => (activeImage ? images.findIndex((item) => item.src === activeImage.src && item.alt === activeImage.alt) : -1),
    [activeImage, images]
  );

  return (
    <>
      <button
        type="button"
        className={`block w-full text-left ${className ?? ""}`}
        onClick={() => setActiveImage(image)}
        aria-label={`Open ${image.alt}`}
      >
        {children}
      </button>
      <GalleryLightbox
        image={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={(direction) => {
          if (activeIndex < 0) return;
          setActiveImage(images[(activeIndex + direction + images.length) % images.length]);
        }}
      />
    </>
  );
}

function GalleryLightbox({
  image,
  onClose,
  onChange
}: {
  image: GalleryLightboxImage | null;
  onClose: () => void;
  onChange: (direction: number) => void;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!image) return;
    setZoom(1);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onChange(-1);
      if (event.key === "ArrowRight") onChange(1);
      if (event.key === "+" || event.key === "=") setZoom((current) => Math.min(3, current + 0.25));
      if (event.key === "-") setZoom((current) => Math.max(0.5, current - 0.25));
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [image, onChange, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/92 text-white backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${image.title} image preview`}
      onMouseDown={onClose}
    >
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{image.eyebrow}</p>
          <h2 className="truncate text-lg font-black sm:text-xl">{image.title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/8 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((current) => Math.max(0.5, current - 0.25));
            }}
            aria-label="Zoom out"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/8 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            onClick={(event) => {
              event.stopPropagation();
              setZoom(1);
            }}
            aria-label="Fit image to screen"
          >
            <Maximize2 size={18} />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/8 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((current) => Math.min(3, current + 0.25));
            }}
            aria-label="Zoom in"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:bg-[var(--gold)]"
            onClick={onClose}
            aria-label="Close image preview"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-full items-center justify-center">
          <img
            src={image.src}
            alt={image.alt}
            className="h-auto w-auto select-none object-contain transition-transform duration-200"
            style={{
              maxHeight: zoom === 1 ? "calc(100vh - 8rem)" : "none",
              maxWidth: zoom === 1 ? "100%" : "none",
              transform: `scale(${zoom})`,
              transformOrigin: "center"
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
