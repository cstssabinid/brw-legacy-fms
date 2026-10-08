const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadedImageDataUrl(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new Error("Choose a JPG, PNG, WebP, or GIF image");
  }
  if (value.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be 4 MB or smaller");
  }

  const base64 = Buffer.from(await value.arrayBuffer()).toString("base64");
  return `data:${value.type};base64,${base64}`;
}
