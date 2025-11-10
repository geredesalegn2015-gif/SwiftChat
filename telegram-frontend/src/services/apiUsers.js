// src/services/apiUsers.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/users";

const apiUsers = axios.create({ baseURL: API_URL });

// Get current user profile
export const getMe = async (token) => {
  const res = await apiUsers.get("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update current user profile
export const updateMe = async (formData, token) => {
  const res = await apiUsers.patch("/updateMe", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  console.log(res.data)
  return res.data;
};

// Get all users for starting a new chat
export const getUsers = async (token) => {
  const res = await apiUsers.get("/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const searchUsers = async (query, token) => {
  const res = await apiUsers.get(`/search?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};
export default apiUsers;
