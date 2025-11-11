// src/services/apiMessages.js
// -----------------------------------------------------------------------------
// Handles message persistence and fetching chat history.
// Real-time sending happens through Socket.IO, not via Axios.
// -----------------------------------------------------------------------------

import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1/messages";

const apiMessages = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// -----------------------------------------------------------------------------
// Fetch all messages in a given chat (private or group)
// -----------------------------------------------------------------------------

export const getMessages = async (chatId, token) => {
  
  const res = await apiMessages.get(`/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Save message to DB manually (rarely used)
// -----------------------------------------------------------------------------
/**
 * This is optional since `socketHandler.js` already saves messages in MongoDB.
 * You might use this only for fallback or offline support.
 */
export const sendMessage = async (messageData, token) => {
  const res = await apiMessages.post("/", messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};
export const uploadMedia = async (formData, token) => {
  // If you want to see the FormData content in console:
  // console.log("formData", formData);

  // POST to the messages upload route (mounted at /api/v1/messages/upload)
  const res = await apiMessages.post("/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // let axios set boundary; but explicitly setting content-type is OK too
      "Content-Type": "multipart/form-data",
    },
  });

  // *** RETURN res.data (not res.data.data) ***
  // res.data for this endpoint is: { files: [ { url, type, name, size }, ... ] }
  return res.data;
};


export default apiMessages;
