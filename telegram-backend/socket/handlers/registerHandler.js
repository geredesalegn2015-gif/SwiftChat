// backend/socket/handlers/registerHandler.js
import { addOnlineUser, getAllOnlineUserIds } from "../utils/onlineUsers.js";

export function registerUserHandler(socket, io) {
  socket.on("registerUser", (userId) => {
    if (!userId) return;
    addOnlineUser(userId, socket.id);
    // join a personal room named by userId for direct targeting
    socket.join(String(userId));
    // broadcast updated online list (simple presence model)
    io.emit("onlineUsersUpdate", { type: "bulk", users: getAllOnlineUserIds() });
  });
}
