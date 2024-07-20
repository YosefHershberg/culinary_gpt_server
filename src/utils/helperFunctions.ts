import sharp from "sharp";

export const mongooseVirtuals = () => {
  return {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc: any, ret: any) => {
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