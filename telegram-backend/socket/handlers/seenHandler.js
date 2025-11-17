// backend/socket/handlers/seenHandler.js
import Message from "../../models/messageModel.js";

export function seenHandler(socket, io) {
  // mark message seen
  socket.on("markMessageSeen", async ({ messageId, chatId, userId }, ack) => {
    try {
      await Message.findByIdAndUpdate(messageId, { $addToSet: { seenBy: userId } });
      // broadcast seen update to the chat room
      io.to(String(chatId)).emit("messageSeenUpdate", { messageId, userId });
      if (typeof ack === "function") ack({ ok: true });
    } catch (err) {
      console.error("seenHandler error:", err);
      if (typeof ack === "function") ack({ ok: false, error: err.message });
    }
  });
}
