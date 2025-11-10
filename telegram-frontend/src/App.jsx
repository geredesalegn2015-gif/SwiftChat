// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./ui/AppLayout";
import { useAuth } from "./hooks/useAuth"; // custom hook for auth state
// src/App.jsx
import { useEffect } from "react";
import { initSocket } from "./hooks/useSocket";

export default function App() {
  const { user } = useAuth(); // get currently logged-in user from context or local state

   useEffect(() => {
    let cleanup;
    if (user?._id) {
      cleanup = initSocket(user._id); // connect socket
    }

    return () => cleanup && cleanup(); // disconnect on unmount
  }, [user?._id]);
  return (
    <Routes>
      {/* Protected routes: accessible only if user is logged in */}
      <Route
        path="/"
        element={user ? <AppLayout /> : <Navigate to="/login" />}
      >
        {/* Default route: redirect to chat page */}
        <Route index element={<Navigate to="/chat" />} />
        {/* Chat route (ChatRoom is inside AppLayout) */}
        <Route path="chat" element={null} />
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} />} />
    </Routes>
  );
}
