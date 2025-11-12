// hooks/useChatWindow.js
import { useEffect, useState } from "react";
import { socket } from "../../hooks/useSocket";
import { useAuth } from "../../context/useAuth";
import { getMessages, uploadMedia } from "../../services/apiMessages";

/**
 * useChatWindow
 * Handles:
 * - Fetching chat messages
 * - Real-time message send/receive via socket
 * - Real-time "seen" updates
 */
export function useChatWindow(selectedChat) {
  const { user: currentUser, token } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const chatId = selectedChat?._id;

  // --- Load chat messages from backend when chat changes ---
  useEffect(() => {
    if (!chatId) return;
    async function load() {
      try {
        const res = await getMessages(chatId, token);
        const msgs = res.map((m) => {
          const senderId = typeof m.sender === "object" ? m.sender._id : m.sender;
          return { ...m, isMine: senderId === currentUser._id };
        });
        setLocalMessages(msgs);
      } catch (err) {
        console.error("Load messages failed:", err);
      }
    }
    load();
  }, [chatId, token, currentUser?._id]);

  // --- Join and leave chat room ---
  useEffect(() => {
    if (!chatId) return;
    socket.emit("joinChat", chatId);
    return () => socket.emit("leaveChat", chatId);
  }, [chatId]);

  // --- Listen for incoming messages ---
  useEffect(() => {
    const handlePrivate = (msg) => {
      if (msg.chat === chatId) {
        const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
        setLocalMessages((prev) => [
          ...prev,
          { ...msg, isMine: senderId === currentUser._id },
        ]);
      }
    };

    socket.on("newPrivateMessage", handlePrivate);
    socket.on("newGroupMessage", (data) => {
      if (data.groupId === chatId) {
        const senderId =
          typeof data.message.sender === "object"
            ? data.message.sender._id
            : data.message.sender;
        setLocalMessages((prev) => [
          ...prev,
          { ...data.message, isMine: senderId === currentUser._id },
        ]);
      }
    });

    return () => {
      socket.off("newPrivateMessage", handlePrivate);
      socket.off("newGroupMessage");
    };
  }, [chatId, currentUser?._id]);

  // --- Listen for message seen updates ---
  useEffect(() => {
    const handleSeenUpdate = ({ messageId, userId }) => {
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, seenBy: [...new Set([...(msg.seenBy || []), userId])] }
            : msg
        )
      );
    };
    socket.on("messageSeenUpdate", handleSeenUpdate);
    return () => socket.off("messageSeenUpdate", handleSeenUpdate);
  }, []);

  // --- Send message (text + optional files) ---
  const handleSend = async ({ text, files }) => {
    if (!selectedChat || (!text && (!files || files.length === 0))) return;

    let uploadedFiles = [];
    if (files && files.length > 0) {
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("mediaFiles", f));
        const uploadRes = await uploadMedia(formData, token);
        uploadedFiles = uploadRes?.files || [];
      } catch (err) {
        console.error("Upload failed:", err);
        return;
      }
    }

    if (selectedChat.type === "group") {
      socket.emit("groupMessage", {
        senderId: currentUser._id,
        groupId: chatId,
        text,
        mediaFiles: uploadedFiles,
      });
    } else {
      const receiverId = selectedChat.participants.find(
        (p) => p._id !== currentUser._id
      )?._id;
      socket.emit("privateMessage", {
        senderId: currentUser._id,
        receiverId,
        text,
        mediaFiles: uploadedFiles,
      });
    }
  };

  return { localMessages, handleSend, setLocalMessages };
}

export default useChatWindow;
