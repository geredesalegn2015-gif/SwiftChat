// backend/socket/handlers/statusHandler.js
import { removeOnlineUserBySocket, getAllOnlineUserIds } from "../utils/onlineUsers.js";

export function statusHandler(socket, io) {
  socket.on("userOnline", (userId) => {
    // This is optional if you use registerUser; kept for flexibility
    socket.join(String(userId));
    io.emit("onlineUsersUpdate", { type: "bulk", users: getAllOnlineUserIds() });
  });

  socket.on("userOffline", (userId) => {
    io.emit("onlineUsersUpdate", { type: "remove", userId });
  });

  socket.on("disconnect", () => {
    const removedUserId = removeOnlineUserBySocket(socket.id);
    if (removedUserId) {
      io.emit("onlineUsersUpdate", { type: "remove", userId: removedUserId });
    }
  });
}
