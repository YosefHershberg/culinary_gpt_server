import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebaseApp from "../../config/firebase";

export const firebaseStorageOperations = {
    uploadImage: async (buffer: ArrayBuffer, imageName: string): Promise<string> => {
        const storage = getStorage(firebaseApp);

        // Create a reference to the storage location
        const storageRef = ref(storage, `images/${imageName}`);

        // Upload the file
        const snapshot = await uploadBytesResumable(storageRef, buffer);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    },

    deleteImage: async (imageName: string): Promise<void> => {
        const storage = getStorage(firebaseApp);

        // Create a reference to the storage location
        const storageRef = ref(storage, `images/${imageName}`);

        // Delete the file
        return await deleteObject(storageRef);
    }
}