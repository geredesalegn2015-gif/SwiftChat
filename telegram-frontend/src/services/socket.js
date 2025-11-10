import { io } from "socket.io-client";

let socket = null;

export function connectSocket(token) {
  if (socket) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
  socket = io(url, { auth: { token }, transports: ["websocket"] });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
