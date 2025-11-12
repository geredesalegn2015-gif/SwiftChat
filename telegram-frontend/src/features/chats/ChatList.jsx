import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../../hooks/useSocket";
import { useChats } from "./useChats";
import { useAuth } from "../../context/useAuth";
import { Image as ImageIcon, FileText as FileIcon, Video as VideoIcon } from "lucide-react";
import { useEffect } from "react";

export default function ChatList({ selectedChat, onSelectChat, localChats = [] }) {
  const { data: chats = [], isLoading } = useChats();
   const queryClient = useQueryClient();
  const { user } = useAuth();
  const allChats = [...localChats, ...chats];
  
  useEffect(() => {
    // When new message arrives anywhere
    const handleNewMessage = () => {
      queryClient.invalidateQueries(["chats"]); // 🔄 refresh chat list
    };

    // Listen to both private and group messages
    socket.on("newPrivateMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewMessage);
    socket.on("messageSeenUpdate", handleNewMessage);

    return () => {
      socket.off("newPrivateMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewMessage);
      socket.off("messageSeenUpdate", handleNewMessage);
    };
  }, [queryClient]);

  if (isLoading) return <Container>Loading chats...</Container>;

  return (
    <Container>
      {allChats.length === 0 ? (
        <Empty>No chats yet</Empty>
      ) : (
        allChats.map((chat) => {
          // 👤 Determine display name and avatar
          let displayName = chat.name || "Unknown";
          let avatar = displayName.charAt(0).toUpperCase();

          if (chat.type === "private" && chat.participants && user) {
            const otherUser = chat.participants.find(
              (p) => p._id !== user._id || p.id !== user.id
            );
            displayName = otherUser?.fullName || "Unknown";
            avatar = displayName.charAt(0).toUpperCase();
          }

          // 📨 Handle last message type
          let lastMsg = "No messages yet";
          if (chat.lastMessage) {
            if (chat.lastMessage.media && chat.lastMessage.media.length > 0) {
              const mediaType = chat.lastMessage.media[0].type;
              if (mediaType.startsWith("image")) lastMsg = "📷 Photo";
              else if (mediaType.startsWith("video")) lastMsg = "🎥 Video";
              else lastMsg = "📎 File";
            } else {
              lastMsg = chat.lastMessage.text || "No messages yet";
            }
          }

          // 🕒 Format time
          const time = chat.lastMessage?.createdAt
            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const unreadCount = chat.unreadCount || 0;

          return (
            <Item
              key={chat._id}
              active={selectedChat?._id === chat._id}
              onClick={() => onSelectChat(chat)}
            >
              <Avatar>{avatar}</Avatar>

              <ChatInfo>
                <TopRow>
                  <ChatName>{displayName}</ChatName>
                  {time && <MessageTime>{time}</MessageTime>}
                </TopRow>

                <BottomRow>
                  <LastMessage>
                    {lastMsg.startsWith("📷") ? (
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

// ---------------- styled-components ----------------

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
  margin-right: 12px;
  font-size: 1.1rem;
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
