import Chat from "../models/chatModel.js";
import { sendMessageSocket } from "../controllers/messageController.js";
import { Server } from "socket.io";

/**
 * -----------------------------
 * Setup Socket.IO server
 * -----------------------------
 *
 * Note:
 * - This socket expects incoming events 'privateMessage' and 'groupMessage'
 *   to include mediaFiles as an array of uploaded-file metadata:
 *     [{ url, type, name, size }, ...]
 *   Because we upload files via HTTP first from the client (useChatWindow).
 *
 * - sendMessageSocket (in controllers) is written to accept either:
 *   - raw file objects (buffers/originalname) — legacy/socket-upload case, OR
 *   - uploaded metadata objects (url,type,name,size) — new flow.
 */
export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Map to track online users (userId -> socketId)
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // registerUser: client should call this after login, passing userId
    socket.on("registerUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`Registered user: ${userId} -> ${socket.id}`);
    });

    /**
     * PRIVATE MESSAGE
     * Expected payload: { senderId, receiverId, text, mediaFiles }
     * mediaFiles: an ARRAY of already-uploaded file metadata objects (url,type,name,size)
     */
    socket.on("privateMessage", async ({ senderId, receiverId, text, mediaFiles }) => {
      try {
        // find or create private chat
        let chat = await Chat.findOne({
          type: "private",
          participants: { $all: [senderId, receiverId], $size: 2 },
        });
        if (!chat) chat = await Chat.create({ type: "private", participants: [senderId, receiverId] });

        // use sendMessageSocket helper --- it will accept mediaFiles that are either:
        // - raw files (buffers etc.) or
        // - already uploaded metadata objects (url,type,name,size)
        const message = await sendMessageSocket({ chatId: chat._id, senderId, text, mediaFiles });

        // emit to receiver (if online)
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit("newPrivateMessage", message);

        // emit back to sender so their UI can receive the saved message from DB
        // const senderSocket = onlineUsers.get(senderId);
        // if (senderSocket) io.to(senderSocket).emit("newPrivateMessage", message);
      } catch (error) {
        console.error("Private message error:", error);
      }
    });

    /**
     * GROUP MESSAGE
     * Expected payload: { senderId, groupId, text, mediaFiles }
     */
    socket.on("groupMessage", async ({ senderId, groupId, text, mediaFiles }) => {
      try {
        const chat = await Chat.findOne({ _id: groupId, type: "group" }).populate("participants");
        if (!chat) return console.log("Group not found", groupId);

        // check membership
        if (!chat.participants.some((p) => p._id.toString() === senderId)) {
          return console.log("Sender not in group", senderId);
        }

        // send message (sendMessageSocket handles mediaFiles appropriately)
        const message = await sendMessageSocket({ chatId: groupId, senderId, text, mediaFiles });

        // broadcast to members
        for (const member of chat.participants) {
          const memberSocket = onlineUsers.get(member._id.toString());
          if (!memberSocket) continue;
          io.to(memberSocket).emit("newGroupMessage", { groupId, message });
        }
      } catch (error) {
        console.error("Group message error:", error);
      }
    });

    // remaining group join/leave/disconnect handlers kept unchanged...
    socket.on("joinGroup", async ({ userId, groupId }) => {
      try {
        const chat = await Chat.findById(groupId);
        if (!chat) return console.log("Group not found.");
        if (!chat.participants.includes(userId)) {
          chat.participants.push(userId);
          await chat.save();
        }
        socket.join(groupId);
        console.log(`User ${userId} joined group ${groupId}`);
        io.to(groupId).emit("groupMemberJoined", { userId, groupId });
      } catch (error) {
        console.error("Group join error:", error);
      }
    });

    socket.on("leaveGroup", async ({ userId, groupId }) => {
      try {
        const chat = await Chat.findById(groupId);
        if (!chat) return console.log("Group not found.");
        chat.participants = chat.participants.filter((id) => id.toString() !== userId);
        await chat.save();
        socket.leave(groupId);
        console.log(`User ${userId} left group ${groupId}`);
        io.to(groupId).emit("groupMemberLeft", { userId, groupId });
      } catch (error) {
        console.error("Leave group error:", error);
      }
    });

    // disconnect: remove from onlineUsers map
    socket.on("disconnect", () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User disconnected: ${userId}`);
          break;
        }
      }
    });
  });
}
