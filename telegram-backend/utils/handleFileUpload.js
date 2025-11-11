// utils/handleFileUpload.js
import { uploadFile } from "../controllers/uploadFileController.js";

// Accepts an array of files and returns uploaded metadata
export async function handleFileUpload(mediaFiles) {
  if (!mediaFiles || mediaFiles.length === 0) return [];

  const media = [];
  for (const file of mediaFiles) {
    const uploaded = await uploadFile(file); // { url, type, name, size }
    media.push(uploaded);
  }
  return media;
}
