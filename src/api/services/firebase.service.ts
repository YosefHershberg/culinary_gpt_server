import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import firebaseApp from "../../config/firebase";
import env from "../../config/env";

/**
 * @module firebase.service
 * 
 * @description This module provides operations for uploading and deleting images from Firebase Storage
 * @exports firebaseStorageOperations
 */

const firebaseStorageOperations = {

    /**
     * @description This function uploads an image to Firebase Storage
     * @param {ArrayBuffer} buffer 
     * @param {string} imageName 
     * @returns {string}
     */
    uploadImage: async (buffer: ArrayBuffer): Promise<string> => {
        const storage = getStorage(firebaseApp);

        const imageName = Math.random().toString(36).substring(15);

        // Create a reference to the storage location
        const storageRef = ref(storage, `images/${imageName}`);

        // Upload the file
        const snapshot = await uploadBytesResumable(storageRef, buffer);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    },

    /**
     * @description This function deletes an image from Firebase Storage
     * @param {string} imageName 
     * @returns {void}
    */
    deleteImage: async (imageName: string): Promise<void> => {
        console.log('Deleting image:', imageName);

        const storage = getStorage(firebaseApp);

        const storagePath = `images/${imageName}`;

        // Create a reference to the storage location
        const storageRef = ref(storage, storagePath);

        // Delete the file
        return await deleteObject(storageRef);
    }
}

export default firebaseStorageOperations