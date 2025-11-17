// backend/socket/utils/onlineUsers.js
export const onlineUsers = new Map(); // userId -> socketId

export function addOnlineUser(userId, socketId) {
  if (!userId) return;
  onlineUsers.set(String(userId), socketId);
}

export function removeOnlineUserBySocket(socketId) {
  for (const [userId, sid] of onlineUsers.entries()) {
    if (sid === socketId) {
      onlineUsers.delete(userId);
      return userId;
    }
  }
  return null;
}

export function getSocketId(userId) {
  return onlineUsers.get(String(userId));
}

export function getAllOnlineUserIds() {
  return [...onlineUsers.keys()];
}
