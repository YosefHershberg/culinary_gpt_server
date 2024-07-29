import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import firebaseApp from "../config/firebase";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
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

export const uploadBase64ImageToStorage = async (base64String: string, imageName: string): Promise<string> => {
    const storage = getStorage(firebaseApp);

    // Extract the base64 part
    const base64Data = base64String.replace(/^data:image\/(png|jpeg);base64,/, '');

    // Convert base64 to ArrayBuffer
    const buffer = base64ToArrayBuffer(base64Data);

    // Create a reference to the storage location
    const storageRef = ref(storage, `images/${imageName}`);

    // Upload the file
    const snapshot = await uploadBytesResumable(storageRef, buffer);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
};