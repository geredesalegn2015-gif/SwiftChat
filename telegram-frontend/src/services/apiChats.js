// src/services/apiChats.js
import apiClient from "./apiClient";

// -----------------------------------------------------------------------------
// Get all chats for logged-in user
// -----------------------------------------------------------------------------
export const getMyChats = async () => {
  const res = await apiClient.get("/chats");
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Create or access PRIVATE chat
// -----------------------------------------------------------------------------
export const accessPrivateChat = async (userId) => {
  const res = await apiClient.post("/chats/access", { userId });
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Create a GROUP chat
// -----------------------------------------------------------------------------
export const createGroupChat = async (payload) => {
  const res = await apiClient.post("/chats/group", payload);
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Fetch single chat by ID
// -----------------------------------------------------------------------------
export const getChatById = async (chatId) => {
  const res = await apiClient.get(`/chats/${chatId}`);
  return res.data.data;
};
