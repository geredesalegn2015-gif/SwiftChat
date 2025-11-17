import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../../hooks/useSocket";
import { useChats } from "./useChats";
import { useAuth } from "../../context/useAuth";
import {
  Image as ImageIcon,
  FileText as FileIcon,
  Video as VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * ChatList
 * - shows list of chats (local + from server)
 * - listens for new message events to refresh the chat list
 * - listens for presence (onlineUsersUpdate) to show online dot
 * - listens for typing events and shows "typing..." preview per chat
 */
export default function ChatList({ selectedChat, onSelectChat, localChats = [] }) {
  const { data: chats = [], isLoading } = useChats();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Combined local + server chats
  const allChats = [...localChats, ...chats];

  // Online users and typing state tracked locally for UI
  const [onlineUserIds, setOnlineUserIds] = useState([]); // array of userId strings
  const [typingByChat, setTypingByChat] = useState({}); // { [chatId]: Set(userId) }

  useEffect(() => {
    // Called when a new message (private or group) or seen update arrives:
    // we rely on react-query to refresh the chat list (lastMessage, unread counts, etc.)
    const handleNewMessage = () => {
      queryClient.invalidateQueries(["chats"]);
    };

    // Presence update handler: payload may be { type: 'bulk', users: [...] } or { type: 'remove', userId }
    const handleOnlineUpdate = (payload) => {
      if (!payload) return;
      if (payload.type === "bulk") {
        setOnlineUserIds(payload.users || []);
      } else if (payload.type === "remove") {
        setOnlineUserIds((prev) => prev.filter((id) => id !== payload.userId));
      } else if (Array.isArray(payload)) {
        setOnlineUserIds(payload);
      } else if (payload.users) {
        setOnlineUserIds(payload.users);
      }
    };

    // Typing handlers:
    const handleUserTyping = ({ chatId, userId }) => {
      if (!chatId || !userId) return;
      setTypingByChat((prev) => {
        const next = { ...prev };
        const setForChat = new Set(next[chatId] || []);
        setForChat.add(String(userId));
        next[chatId] = setForChat;
        return next;
      });
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
      if (!chatId || !userId) return;
      setTypingByChat((prev) => {
        const next = { ...prev };
        const setForChat = new Set(next[chatId] || []);
        setForChat.delete(String(userId));
        if (setForChat.size === 0) delete next[chatId];
        else next[chatId] = setForChat;
        return next;
      });
    };

    // Register socket listeners
    socket.on("newPrivateMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewMessage);
    socket.on("messageSeenUpdate", handleNewMessage);

    socket.on("onlineUsersUpdate", handleOnlineUpdate);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    // Cleanup
    return () => {
      socket.off("newPrivateMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewMessage);
      socket.off("messageSeenUpdate", handleNewMessage);

      socket.off("onlineUsersUpdate", handleOnlineUpdate);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [queryClient]);

  if (isLoading) return <Container>Loading chats...</Container>;

  return (
    <Container>
      {allChats.length === 0 ? (
        <Empty>No chats yet</Empty>
      ) : (
        allChats.map((chat) => {
          // Determine display name and avatar
          let displayName = chat.name || "Unknown";
          let avatar = displayName.charAt(0).toUpperCase();

          // For private chats, show the other participant name
          if (chat.type === "private" && chat.participants && user) {
            const otherUser = chat.participants.find(
              (p) => String(p._id) !== String(user._id) && p._id !== user.id
            );
            displayName = otherUser?.fullName || otherUser?.name || displayName;
            avatar = (displayName || "U").charAt(0).toUpperCase();
          }

          // Last message preview handling (images/videos/files or text)
          let lastMsg = "No messages yet";
          if (chat.lastMessage) {
            if (chat.lastMessage.media && chat.lastMessage.media.length > 0) {
              const mediaType = chat.lastMessage.media[0].type || "";
              if (mediaType.startsWith("image")) lastMsg = "📷 Photo";
              else if (mediaType.startsWith("video")) lastMsg = "🎥 Video";
              else lastMsg = "📎 File";
            } else {
              lastMsg = chat.lastMessage.text || "No messages yet";
            }
          }

          // Show typing preview if someone (other than current user) is typing in this chat
          const typingSet = typingByChat[chat._id];
          let isTyping = false;
          let typingUserName = "";
          if (typingSet && typingSet.size > 0) {
            // Prefer showing the first typing user's name (if participant info exists)
            const typingUserId = Array.from(typingSet)[0];
            if (chat.participants && chat.type === "private") {
              const other = chat.participants.find((p) => String(p._id) === String(typingUserId));
              typingUserName = other?.fullName || other?.name || "Someone";
            } else if (chat.participants) {
              const userObj = chat.participants.find((p) => String(p._id) === String(typingUserId));
              typingUserName = userObj?.fullName || userObj?.name || "Someone";
            }
            // only show typing preview for others (not the current user)
            isTyping = String(typingUserId) !== String(user?._id);
          }

          // Time formatting for last message
          const time = chat.lastMessage?.createdAt
            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const unreadCount = chat.unreadCount || 0;

          // Online status for private chats (check other participant)
          let isOtherOnline = false;
          if (chat.type === "private" && chat.participants && user) {
            const otherUser = chat.participants.find((p) => String(p._id) !== String(user._id));
            if (otherUser) isOtherOnline = onlineUserIds.includes(String(otherUser._id));
          } else {
            // for groups, optionally show if at least one member is online
            const someoneOnline = chat.participants?.some((p) => onlineUserIds.includes(String(p._id)));
            if (someoneOnline) isOtherOnline = true;
          }

          return (
            <Item
              key={chat._id}
              active={selectedChat?._id === chat._id}
              onClick={() => onSelectChat(chat)}
            >
              <AvatarWrap>
                <Avatar>{avatar}</Avatar>
                {isOtherOnline && <OnlineDot title="Online" />}
              </AvatarWrap>

              <ChatInfo>
                <TopRow>
                  <ChatName>{displayName}</ChatName>
                  {time && <MessageTime>{time}</MessageTime>}
                </TopRow>

                <BottomRow>
                  <LastMessage>
                    {isTyping ? (
                      // typing preview has precedence over last message
                      <em>{typingUserName || "typing..."} is typing…</em>
                    ) : lastMsg.startsWith("📷") ? (
                      <IconRow>
                        <ImageIcon size={15} />
                        <span> Photo</span>
                      </IconRow>
                    ) : lastMsg.startsWith("🎥") ? (
                      <IconRow>
                        <VideoIcon size={15} />
                        <span> Video</span>
                      </IconRow>
                    ) : lastMsg.startsWith("📎") ? (
                      <IconRow>
                        <FileIcon size={15} />
                        <span> File</span>
                      </IconRow>
                    ) : (
                      lastMsg
                    )}
                  </LastMessage>

                  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
                </BottomRow>
              </ChatInfo>
            </Item>
          );
        })
      )}
    </Container>
  );
}

/* ---------------- styled-components ---------------- */

const Container = styled.div`
  flex: 1;
  background: #17212b;
  overflow-y: auto;
  padding: 0.25rem 0;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 14px;
  margin: 2px 6px;
  border-radius: 10px;
  background: ${({ active }) => (active ? "#2b5278" : "transparent")};
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1e2a36;
  }
`;

const AvatarWrap = styled.div`
  position: relative;
  margin-right: 12px;
`;

const Avatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #2b5278;
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`;

const OnlineDot = styled.span`
  width: 10px;
  height: 10px;
  background: #3be86f;
  border-radius: 50%;
  border: 2px solid #0e1621;
  position: absolute;
  right: -2px;
  bottom: -2px;
`;

const ChatInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatName = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const MessageTime = styled.div`
  color: #9aa5b1;
  font-size: 0.75rem;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LastMessage = styled.div`
  color: #9aa5b1;
  font-size: 0.8rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 190px;
`;

const Badge = styled.div`
  background: #2b5278;
  color: #fff;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconRow = styled.div`
  display: flex;
  align-items: center;
  color: #9aa5b1;
  gap: 4px;
`;

const Empty = styled.div`
  color: #9aa5b1;
  padding: 2rem;
  text-align: center;
`;
