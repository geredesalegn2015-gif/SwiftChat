// src/hooks/useSocket.js
import { io } from "socket.io-client";

/**
 * Singleton socket instance. Do NOT create multiple sockets.
 * Use initSocket() to connect after auth (backend uses httpOnly cookie).
 */
export const socket = io(import.meta.env.VITE_WS_BASE || "http://localhost:8000", {
  autoConnect: false,
  withCredentials: true, // ensures cookie is sent in handshake
});

/**
 * initSocket(userId) -> connects and registers user on server.
 * Returns a cleanup function to disconnect.
 */
export function initSocket(userId) {
  if (!userId) return () => {};
  if (!socket.connected) socket.connect();

  // server should validate cookie and/or handshake
  socket.emit("registerUser", userId);

  const onConnect = () => console.log("Socket connected:", socket.id);
  const onDisconnect = () => console.log("Socket disconnected");

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);

  // cleanup function
  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.disconnect();
  };
}
