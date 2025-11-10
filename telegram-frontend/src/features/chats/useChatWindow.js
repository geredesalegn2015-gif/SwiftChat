import { useEffect, useState } from "react";
import { socket } from "../../hooks/useSocket";
import { useAuth } from "../../context/useAuth";
import { getMessages } from "../../services/apiMessages"; // ✅ import your API service

export function useChatWindow(selectedChat) {
  const { user: currentUser, token } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const chatId = selectedChat?._id;

  // 1️⃣ Fetch messages from DB when chat changes
  useEffect(() => {
    if (!chatId) return;

    async function loadMessages() {
      try {
        const res = await getMessages(chatId, token);

        const msgs = res.map((m) => {
          const senderId =
            typeof m.sender === "object" ? m.sender._id : m.sender;
          return {
            ...m,
            isMine: senderId === currentUser._id,
          };
        });

        setLocalMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    loadMessages();
  }, [chatId, currentUser?._id, token]);

  // 2️⃣ Listen for real-time messages
  useEffect(() => {
    if (!chatId) return;

    const handleIncoming = (msg) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      console.log("senderId:", senderId, " currentUserId:", currentUser._id);

      if (msg.chat === chatId) {
        setLocalMessages((prev) => [
          ...prev,
          { ...msg, isMine: senderId === currentUser._id },
        ]);
      }
    };

    socket.on("newPrivateMessage", handleIncoming);
    socket.on("newGroupMessage", handleIncoming);

    return () => {
      socket.off("newPrivateMessage", handleIncoming);
      socket.off("newGroupMessage", handleIncoming);
    };
  }, [chatId, currentUser?._id]);

  // 3️⃣ Send message
  const handleSend = (text) => {
    if (!text.trim() || !selectedChat || !currentUser?._id) return;

    const message = {
      _id: `temp-${Date.now()}`,
      sender: currentUser._id,
      chat: selectedChat._id,
      text,
      createdAt: new Date().toISOString(),
      isMine: true,
    };

    setLocalMessages((prev) => [...prev, message]);

    if (selectedChat.type === "group") {
      socket.emit("groupMessage", { groupId: selectedChat._id, text });
    } else {
      const receiverId = selectedChat.participants.find(
        (p) => p._id !== currentUser._id
      )?._id;

      socket.emit("privateMessage", {
        senderId: currentUser._id,
        receiverId,
        text,
      });
    }
  };

  return { localMessages, handleSend };
}
