// backend/socket/handlers/typingHandler.js
export function typingHandler(socket, io) {
  socket.on("typing", ({ chatId, userId }) => {
    if (!chatId) return;
    // notify others in the chat room that user is typing
    socket.to(String(chatId)).emit("userTyping", { chatId, userId });
  });

  socket.on("stopTyping", ({ chatId, userId }) => {
    if (!chatId) return;
    socket.to(String(chatId)).emit("userStoppedTyping", { chatId, userId });
  });
}
