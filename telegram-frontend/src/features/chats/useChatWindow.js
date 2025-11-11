import { useEffect, useState } from "react";
import { socket } from "../../hooks/useSocket";
import { useAuth } from "../../context/useAuth";
import { getMessages,uploadMedia } from "../../services/apiMessages";

/*
  useChatWindow hook
  - fetches messages for the selected chat
  - listens for incoming socket messages
  - handles sending messages:
      * if files exist -> upload to server via HTTP (/api/upload)
      * then emit socket event with text + uploaded file metadata only
  This ensures sockets never carry raw file data.
*/

export function useChatWindow(selectedChat) {
  const { user: currentUser, token } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const chatId = selectedChat?._id;

  // ------------------ Fetch messages from backend ------------------
  useEffect(() => {
    if (!chatId) return;

    async function loadMessages() {
      try {
        // getMessages should return an array of message documents (matching your model)
        const res = await getMessages(chatId, token);
        const msgs = res.map((m) => {
          const senderId = typeof m.sender === "object" ? m.sender._id : m.sender;
          return { ...m, isMine: senderId === currentUser._id };
        });
        setLocalMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }

    loadMessages();
  }, [chatId, currentUser?._id, token]);

  // ------------------ Listen for incoming socket messages ------------------
  useEffect(() => {
    if (!chatId) return;

    const handleIncoming = (msg) => {
      // msg may be a Mongoose document serialized from server (has .chat)
      const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      // Only append messages that belong to the currently open chat
      if (msg.chat === chatId) {
        setLocalMessages((prev) => [...prev, { ...msg, isMine: senderId === currentUser._id }]);
      }
    };

    // server emits "newPrivateMessage" and "newGroupMessage" — listen to both
    socket.on("newPrivateMessage", handleIncoming);
    socket.on("newGroupMessage", handleIncoming);

    return () => {
      socket.off("newPrivateMessage", handleIncoming);
      socket.off("newGroupMessage", handleIncoming);
    };
  }, [chatId, currentUser?._id]);

  // ------------------ Send message (text + optional files) ------------------
  const handleSend = async ({ text, files }) => {
    if (!selectedChat || (!text && (!files || files.length === 0))) return;

    // Create optimistic UI message using local preview URLs for immediate feedback
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      sender: currentUser._id,
      chat: selectedChat._id,
      text: text || "",
      media:
        files?.map((file) => ({
          name: file.name,
          type: file.type ? file.type.split("/")[0] : "document",
          size: file.size,
          url: URL.createObjectURL(file), // browser preview until upload finishes
        })) || [],
      createdAt: new Date().toISOString(),
      isMine: true,
      type: files?.length > 0 ? "file" : "text",
    };
    setLocalMessages((prev) => [...prev, tempMessage]);

    // -------------------------------
    // 1) If there are files, upload them via HTTP first
    //    The server route should return JSON: { files: [{ url, type, name, size }, ...] }
    // -------------------------------
  let uploadedFiles = [];
if (files && files.length > 0) {
  try {
    const formData = new FormData();
    files.forEach((f) => formData.append("mediaFiles", f));

    // uploadMedia now returns { files: [...] }
    const uploadRes = await uploadMedia(formData, token);
    console.log("Upload response:", uploadRes);

    // Pull files array reliably
    uploadedFiles = uploadRes?.files || [];
    if (!uploadedFiles.length) {
      console.warn("Upload returned no files:", uploadRes);
    }
  } catch (err) {
    console.error("File upload error:", err);
    return;
  }
}



    // -------------------------------
    // 2) Emit socket event with text + uploadedFiles (only metadata)
    // -------------------------------
    if (selectedChat.type === "group") {
      socket.emit("groupMessage", {
        senderId: currentUser._id,
        groupId: selectedChat._id,
        text,
        mediaFiles: uploadedFiles, // array of { url, type, name, size }
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

    // -------------------------------
    // 3) Optionally: store message via REST API (if your flow requires saving via REST)
    //    In this implementation the server socket handler saves the message (sendMessageSocket),
    //    so calling sendMessage() via API is optional. If you prefer server to save via REST,
    //    call your sendMessage API here instead.
    // -------------------------------
  };

  return { localMessages, handleSend };
}

export default useChatWindow;
