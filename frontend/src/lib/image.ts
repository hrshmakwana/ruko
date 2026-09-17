/** Shrink a screenshot before upload.
 *
 * Phone screenshots are often 3–8 MB. Bedrock does not need that much detail to
 * read a WhatsApp message, and every extra pixel costs upload time on a slow
 * connection and tokens on the model. 1600px on the long edge keeps text sharp.
 */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

export interface PreparedImage {
  blob: Blob;
  previewUrl: string;
  contentType: "image/jpeg";
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  // A white backdrop so PNG screenshots with transparency do not turn black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("encode_failed");

  return { blob, previewUrl: URL.createObjectURL(blob), contentType: "image/jpeg" };
}
