// src/services/apiMessages.js
import apiClient from "./apiClient";

// -----------------------------------------------------------------------------
// Fetch all messages in a chat
// -----------------------------------------------------------------------------
export const getMessages = async (chatId) => {
  const res = await apiClient.get(`/messages/${chatId}`);
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Save message manually
// -----------------------------------------------------------------------------
export const sendMessage = async (messageData) => {
  const res = await apiClient.post("/messages", messageData);
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Upload media (multipart)
// -----------------------------------------------------------------------------
export const uploadMedia = async (formData) => {
  const res = await apiClient.post("/messages/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { files: [...] }
};
