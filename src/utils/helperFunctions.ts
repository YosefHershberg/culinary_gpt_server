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