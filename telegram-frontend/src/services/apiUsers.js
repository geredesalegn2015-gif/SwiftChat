// src/services/apiUsers.js
import apiClient from "./apiClient";

// Get current user
export const getMe = async () => {
  const res = await apiClient.get("/users/me");
  return res.data;
};

// Update current user
export const updateMe = async (formData) => {
  const res = await apiClient.patch("/users/updateMe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Get all users
export const getUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data;
};

// Search users
export const searchUsers = async (query) => {
  const res = await apiClient.get(`/users/search?q=${query}`);
  return res.data.data;
};
