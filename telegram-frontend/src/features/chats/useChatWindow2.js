// hooks/useChatWindow.js
import { useEffect, useState, useCallback, useRef } from "react";
import { socket } from "../../hooks/useSocket";
import { useAuth } from "../../context/useAuth";
import { getMessages, uploadMedia } from "../../services/apiMessages";

export function useChatWindow(selectedChat) {
  const { user: currentUser, token } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const chatId = selectedChat?._id;

  // --- Persist typing timeout ---
  const typingTimeout = useRef(null);

  // --- Register user on socket ---
  useEffect(() => {
    if (!currentUser) return;
    socket.emit("registerUser", currentUser._id);

    const handleUnload = () => {
      try {
        socket.emit("userOffline", currentUser._id);
      } catch (e) {console.error(e)}
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [currentUser]);

  // --- Load messages ---
  const loadMessages = useCallback(async () => {
    if (!chatId) return;
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
  }, [chatId, token, currentUser?._id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // --- Join/leave chat room ---
  useEffect(() => {
    if (!chatId) return;
    socket.emit("joinChat", chatId);
    return () => socket.emit("leaveChat", chatId);
  }, [chatId]);

  // --- Add message helper ---
  const addMessage = useCallback(
    (msg) => {
      const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      setLocalMessages((prev) => [...prev, { ...msg, isMine: senderId === currentUser._id }]);
    },
    [currentUser?._id]
  );

  // --- Socket listeners ---
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const handlePrivate = (msg) => {
      if (String(msg.chat) === String(chatId)) addMessage(msg);
    };

    const handleGroup = (data) => {
      if (String(data.groupId) === String(chatId)) addMessage(data.message);
    };

    const handleSeen = ({ messageId, userId }) => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, seenBy: [...new Set([...(m.seenBy || []), userId])] } : m
        )
      );
    };

    const handleDelivered = ({ messageId }) => {
      setLocalMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, delivered: true } : m))
      );
    };

    const handleTyping = ({ userId }) => {
      if (!userId || userId === currentUser._id) return;
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleOnlineUsersUpdate = (payload) => {
      if (!payload) return;
      if (payload.type === "bulk") setOnlineUsers(payload.users || []);
      else if (payload.type === "remove") setOnlineUsers((prev) => prev.filter((u) => u !== payload.userId));
      else setOnlineUsers(payload.users || payload);
    };

    socket.on("newPrivateMessage", handlePrivate);
    socket.on("newGroupMessage", handleGroup);
    socket.on("messageSeenUpdate", handleSeen);
    socket.on("messageDelivered", handleDelivered);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);
    socket.on("onlineUsersUpdate", handleOnlineUsersUpdate);

    return () => {
      socket.off("newPrivateMessage", handlePrivate);
      socket.off("newGroupMessage", handleGroup);
      socket.off("messageSeenUpdate", handleSeen);
      socket.off("messageDelivered", handleDelivered);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
      socket.off("onlineUsersUpdate", handleOnlineUsersUpdate);
    };
  }, [addMessage, chatId, currentUser?._id,currentUser]);

  // --- Send message ---
  const handleSend = useCallback(
    async ({ text, files }) => {
      if (!selectedChat || (!text && (!files || files.length === 0))) return;

      let uploadedFiles = [];
      if (files?.length) {
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
        const receiverId = selectedChat.participants.find((p) => p._id !== currentUser._id)?._id;
        socket.emit("privateMessage", {
          senderId: currentUser._id,
          receiverId,
          text,
          mediaFiles: uploadedFiles,
        });
      }
    },
    [selectedChat, chatId, currentUser?._id, token]
  );

  // --- Typing emitters ---
  const startTyping = useCallback(() => {
    if (!chatId || !currentUser) return;

    socket.emit("typing", { chatId, userId: currentUser._id });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId, userId: currentUser._id });
    }, 1500);
  }, [chatId,currentUser]);

  const stopTyping = useCallback(() => {
    if (!chatId || !currentUser) return;
    socket.emit("stopTyping", { chatId, userId: currentUser._id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  }, [chatId, currentUser]);

  return {
    localMessages,
    handleSend,
    setLocalMessages,
    typingUsers,
    startTyping,
    stopTyping,
    onlineUsers,
  };
}

export default useChatWindow;
