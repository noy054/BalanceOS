export type ImageKind = {
  mimeType: string;
  extension: string;
};

const JPEG: ImageKind = { mimeType: 'image/jpeg', extension: 'jpg' };
const PNG: ImageKind = { mimeType: 'image/png', extension: 'png' };
const WEBP: ImageKind = { mimeType: 'image/webp', extension: 'webp' };
const HEIC: ImageKind = { mimeType: 'image/heic', extension: 'heic' };

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);

export function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return JPEG;
  }
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return PNG;
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return WEBP;
  }
  if (
    buffer.toString('ascii', 4, 8) === 'ftyp' &&
    HEIC_BRANDS.has(buffer.toString('ascii', 8, 12))
  ) {
    return HEIC;
  }
  return null;
}
