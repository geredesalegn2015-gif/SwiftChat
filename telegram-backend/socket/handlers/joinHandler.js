// backend/socket/handlers/joinHandler.js
export function joinHandler(socket) {
  socket.on("joinChat", (chatId) => {
    if (!chatId) return;
    socket.join(String(chatId));
    socket.emit("joinedChat", chatId);
  });

  socket.on("leaveChat", (chatId) => {
    if (!chatId) return;
    socket.leave(String(chatId));
    socket.emit("leftChat", chatId);
  });
}
