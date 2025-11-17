// backend/socket/handlers/groupMessageHandler.js
import Chat from "../../models/chatModel.js";
import { sendMessageSocket } from "../../controllers/messageController.js";
import { getSocketId } from "../utils/onlineUsers.js";

export function groupMessageHandler(socket, io) {
  socket.on("groupMessage", async (payload, ack) => {
    try {
      const { senderId, groupId, text, mediaFiles } = payload;
      const chat = await Chat.findById(groupId).populate("participants");
      if (!chat) {
        if (typeof ack === "function") ack({ ok: false, error: "Group not found" });
        return;
      }

      const message = await sendMessageSocket({ chatId: groupId, senderId, text, mediaFiles });

      // Emit to everyone in chat room
      io.to(String(groupId)).emit("newGroupMessage", { groupId, message });

      // Optionally notify sender that message delivered if others are online
      // (emit delivered back to sender)
      io.to(String(senderId)).emit("messageDelivered", { messageId: message._id });

      if (typeof ack === "function") ack({ ok: true, message });
    } catch (err) {
      console.error("groupMessage handler error:", err);
      if (typeof ack === "function") ack({ ok: false, error: err.message });
    }
  });
}
