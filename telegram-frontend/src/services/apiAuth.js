// src/services/apiAuth.js
import apiClient from "./apiClient";

// Signup
export const signup = async (userData) => {
  const res = await apiClient.post("/auth/signup", userData);
  return res.data;
};

// Login
export const login = async (credentials) => {
  const res = await apiClient.post("/auth/login", credentials);
  return res.data; 
};

// Logout
export const logout = async () => {
  const res = await apiClient.get("/auth/logout");
  return res.data;
};
