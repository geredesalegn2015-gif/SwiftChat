// src/services/apiChats.js
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1/chats";

const apiChats = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// -----------------------------------------------------------------------------
// Get all chats for logged-in user
// -----------------------------------------------------------------------------
export const getMyChats = async (token) => {
  const res = await apiChats.get("/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Create or access a PRIVATE chat (one-to-one)
// -----------------------------------------------------------------------------
export const accessPrivateChat = async (userId, token) => {
  const res = await apiChats.post(
    "/access",
    { userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Create a GROUP chat
// -----------------------------------------------------------------------------
export const createGroupChat = async (payload, token) => {
  const res = await apiChats.post("/group", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

// -----------------------------------------------------------------------------
// Fetch single chat by ID
// -----------------------------------------------------------------------------
export const getChatById = async (chatId, token) => {
  const res = await apiChats.get(`/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export default apiChats;
