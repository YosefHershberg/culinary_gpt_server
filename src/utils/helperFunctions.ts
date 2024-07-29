import sharp from "sharp";
import crypto from "crypto";

export const mongooseVirtuals = (): Object => {
  return {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export async function compressBase64Image(base64Image: string, quality: number): Promise<string> {
  // Decode base64 image to a buffer
  const imageBuffer = Buffer.from(base64Image, 'base64');

  // Compress the image
  const compressedBuffer = await sharp(imageBuffer)
    .resize({ width: 300 })
    .jpeg({ quality: quality }) // You can also use .png() or .webp() depending on the image type
    .toBuffer();

  // Re-encode the compressed image to base64
  const compressedBase64 = compressedBuffer.toString('base64');

  return compressedBase64;
}

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  // Decode base64 to raw binary string
  const binaryString = atob(base64);

  // Create a new ArrayBuffer with the length of the binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  // Fill the array buffer with the binary string's char codes
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

export const hashString = (str: string): string => {
  return crypto.createHash('sha256').update(str).digest('hex')
}