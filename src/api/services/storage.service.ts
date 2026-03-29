import { supabaseAdmin } from "../../config/supabase";
import env from "../../utils/env";

const BUCKET = 'recipe-images';

const getEnvPrefix = () => env.NODE_ENV === 'production' ? 'prod' : 'dev';

const getStoragePath = (userId: string, imageName: string) =>
    `${getEnvPrefix()}/${userId}/${imageName}.jpg`;

const getUserFolderPath = (userId: string) =>
    `${getEnvPrefix()}/${userId}`;

const storageServices = {

    uploadImage: async (buffer: ArrayBuffer, imageName: string, userId: string): Promise<string> => {
        const path = getStoragePath(userId, imageName);

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

    deleteImage: async (imageName: string, userId: string): Promise<void> => {
        const path = getStoragePath(userId, imageName);

        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove([path]);

        if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
    },

    deleteUserImages: async (userId: string): Promise<void> => {
        const folderPath = getUserFolderPath(userId);

        const { data: files, error: listError } = await supabaseAdmin.storage
            .from(BUCKET)
            .list(folderPath);

        if (listError) throw new Error(`Supabase Storage list failed: ${listError.message}`);
        if (!files || files.length === 0) return;

        const paths = files.map(file => `${folderPath}/${file.name}`);

        const { error: removeError } = await supabaseAdmin.storage
            .from(BUCKET)
            .remove(paths);

        if (removeError) throw new Error(`Supabase Storage bulk delete failed: ${removeError.message}`);
    },
}

export default storageServices
