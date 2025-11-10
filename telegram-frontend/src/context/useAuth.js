import { useContext } from "react";
import AuthContext from "./AuthContext";

// Custom hook to access AuthContext easily
export const useAuth = () => useContext(AuthContext);
