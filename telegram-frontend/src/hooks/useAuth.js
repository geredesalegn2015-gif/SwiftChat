// src/hooks/useAuth.js
import { useContext } from "react";
import AuthContext from "../context/AuthContext"; // ✅ default import

// Named export hook
export const useAuth = () => {
  return useContext(AuthContext);
};
