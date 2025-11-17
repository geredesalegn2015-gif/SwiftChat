// backend/socket/handlers/privateMessageHandler.js
import Chat from "../../models/chatModel.js";
import { sendMessageSocket } from "../../controllers/messageController.js";
import { getSocketId } from "../utils/onlineUsers.js";

export function privateMessageHandler(socket, io) {
  socket.on("privateMessage", async (payload, ack) => {
    try {
      const { senderId, receiverId, text, mediaFiles } = payload;

      // find or create private chat
      let chat = await Chat.findOne({
        type: "private",
        participants: { $all: [senderId, receiverId], $size: 2 },
      });
      if (!chat) {
        chat = await Chat.create({ type: "private", participants: [senderId, receiverId] });
      }

      // save message using existing controller (sendMessageSocket)
      const message = await sendMessageSocket({ chatId: chat._id, senderId, text, mediaFiles });

      // emit to receiver (via personal room) and sender (personal room)
      const receiverRoom = String(receiverId);
      const senderRoom = String(senderId);

      io.to(receiverRoom).emit("newPrivateMessage", message);
      io.to(senderRoom).emit("newPrivateMessage", message);

      // optional: emit delivered event to sender once receiver socket exists
      const receiverSocket = getSocketId(receiverId);
      if (receiverSocket) {
        io.to(senderRoom).emit("messageDelivered", { messageId: message._id });
      }

      if (typeof ack === "function") ack({ ok: true, message });
    } catch (err) {
      console.error("privateMessage handler error:", err);
      if (typeof ack === "function") ack({ ok: false, error: err.message });
    }
  });
}
