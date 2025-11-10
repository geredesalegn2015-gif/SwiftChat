import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/auth";

const apiAuth = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies if your backend uses them
});

// Signup
export const signup = async (userData) => {
  console.log("signup user:", userData);
  const res = await apiAuth.post("/signup", userData);
  return res.data;
};

// Login
export const login = async (credentials) => {
  console.log("logging in:", credentials);
  const res = await apiAuth.post("/login", credentials);
  return res.data; // must return { user, token } from backend
};

// Logout
export const logout = async () => {
  const res = await apiAuth.get("/logout");
  return res.data;
};

export default apiAuth;
