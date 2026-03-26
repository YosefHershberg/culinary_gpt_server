import { supabaseAdmin } from "../../config/supabase";
import env from "../../utils/env";

const BUCKET = 'recipe-images';

const getStoragePath = (imageName: string) =>
    `${env.NODE_ENV === 'production' ? 'prod' : 'dev'}/${imageName}.jpg`;

const storageServices = {

    uploadImage: async (buffer: ArrayBuffer, imageName: string): Promise<string> => {
        const path = getStoragePath(imageName);

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(path, buffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from(BUCKET)
            .getPublicUrl(path);

        return publicUrl;
    },

    deleteImage: async (imageName: string): Promise<void> => {
        const path = getStoragePath(imageName);

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove([path]);

        if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
    }
}

export default storageServices
