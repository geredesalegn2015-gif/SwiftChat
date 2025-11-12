// backend/socketHandler.js
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import { sendMessageSocket } from "../controllers/messageController.js";
import { Server } from "socket.io";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("registerUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`Registered: ${userId}`);
    });

    // --- Join/leave chat rooms ---
    socket.on("joinChat", (chatId) => {
      socket.join(chatId.toString());
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId.toString());
      console.log(`User left chat: ${chatId}`);
    });

    // --- Private message ---
    socket.on("privateMessage", async ({ senderId, receiverId, text, mediaFiles }) => {
      try {
        let chat = await Chat.findOne({
          type: "private",
          participants: { $all: [senderId, receiverId], $size: 2 },
        });
        if (!chat) chat = await Chat.create({ type: "private", participants: [senderId, receiverId] });

        const message = await sendMessageSocket({ chatId: chat._id, senderId, text, mediaFiles });

        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("newPrivateMessage", message);

        // Also emit to sender for consistency
        const senderSocket = onlineUsers.get(senderId);
        if (senderSocket) io.to(senderSocket).emit("newPrivateMessage", message);
      } catch (err) {
        console.error("Private message error:", err);
      }
    });

    // --- Group message ---
    socket.on("groupMessage", async ({ senderId, groupId, text, mediaFiles }) => {
      try {
        const chat = await Chat.findById(groupId).populate("participants");
        if (!chat) return;

        const message = await sendMessageSocket({ chatId: groupId, senderId, text, mediaFiles });

        for (const member of chat.participants) {
          const memberSocket = onlineUsers.get(member._id.toString());
          if (memberSocket) io.to(memberSocket).emit("newGroupMessage", { groupId, message });
        }
      } catch (err) {
        console.error("Group message error:", err);
      }
    });

    // --- Mark message seen ---
    socket.on("markMessageSeen", async ({ messageId, chatId, userId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { $addToSet: { seenBy: userId } });
        io.to(chatId.toString()).emit("messageSeenUpdate", { messageId, userId });
      } catch (err) {
        console.error("markMessageSeen error:", err);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User disconnected: ${userId}`);
          break;
        }
      }
    });
  });
}
