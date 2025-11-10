// src/features/chats/ChatWindow.jsx
import styled from "styled-components";
import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import { useChatWindow } from "./useChatWindow";

export default function ChatWindow({ selectedChat }) {
  const { localMessages, handleSend } = useChatWindow(selectedChat);
  const messagesEndRef = useRef(null);

  // 🔽 Scroll to bottom whenever new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  if (!selectedChat)
    return <Empty>Select a chat to start messaging</Empty>;

  return (
    <Container>
      {/* 🧭 Chat Header (Avatar + Name + Online/Seen Status) */}
      <Header>
        <Avatar
          src={selectedChat?.avatar || "/default-avatar.png"}
          alt="avatar"
        />
        <HeaderInfo>
          <ChatTitle>{selectedChat?.name || "Chat"}</ChatTitle>
          <StatusText>
            {selectedChat?.isOnline
              ? "online"
              : "last seen recently"}
          </StatusText>
        </HeaderInfo>
      </Header>

      {/* 💬 Messages Section */}
      <MessagesWrap>
        {localMessages.map((m) => (
          <MessageRow key={m._id} isSender={m.isMine}>
            {/* 👤 Optional avatar (for receiver’s messages only) */}
            {!m.isMine && (
              <SmallAvatar
                src={selectedChat?.avatar || "/default-avatar.png"}
                alt="avatar"
              />
            )}

            <MessageBubble isSender={m.isMine}>
              {m.text}

              {/* 🕒 Time + Seen status (✓✓) below each message */}
              <MetaInfo isSender={m.isMine}>
                <TimeText>
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TimeText>
                {m.isMine && (
                  <SeenMark seen={m.seen}>
                    {m.seen ? "✓✓" : "✓"}
                  </SeenMark>
                )}
              </MetaInfo>
            </MessageBubble>
          </MessageRow>
        ))}

        {/* 👇 Dummy div used to scroll into view */}
        <div ref={messagesEndRef} />
      </MessagesWrap>

      {/* ✍️ Message Input (already handled) */}
      <MessageInput onSend={handleSend} />
    </Container>
  );
}

// ---------------- styled-components ----------------

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #0e1621;
  height: 100vh;
`;

// 🧭 Header Styles
const Header = styled.div`
  background: #0e1621;
  border-bottom: 1px solid #1e2a36;
  padding: 0.8rem 1rem;
  height: 60px;
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatTitle = styled.div`
  font-weight: 600;
  color: #fff;
  font-size: 1.1rem;
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: #9aa5b1;
`;

// 💬 Messages Section
const MessagesWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: ${({ isSender }) =>
    isSender ? "flex-end" : "flex-start"};
  gap: 6px;
`;

const SmallAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;

// 🗨️ Message Bubble with Telegram-like tail
const MessageBubble = styled.div`
  position: relative;
  align-self: ${({ isSender }) =>
    isSender ? "flex-end" : "flex-start"};
  background: ${({ isSender }) =>
    isSender ? "#2b5278" : "#182533"};
  color: #fff;
  border-radius: 16px;
  padding: 10px 14px;
  max-width: 70%;
  word-wrap: break-word;

  /* Tail-like triangle for Telegram-style bubbles */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    ${({ isSender }) => (isSender ? "right: -6px;" : "left: -6px;")}
    width: 12px;
    height: 12px;
    background: ${({ isSender }) =>
      isSender ? "#2b5278" : "#182533"};
    clip-path: polygon(0 100%, 100% 100%, 100% 0);
  }
`;

// 🕒 Timestamp and Seen checkmarks
const MetaInfo = styled.div`
  display: flex;
  justify-content: ${({ isSender }) =>
    isSender ? "flex-end" : "flex-start"};
  align-items: center;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ isSender }) =>
    isSender ? "#d0e4ff" : "#9aa5b1"};
  gap: 4px;
`;

const TimeText = styled.span``;

const SeenMark = styled.span`
  color: ${({ seen }) => (seen ? "#4fc3f7" : "#9aa5b1")};
  font-weight: bold;
`;

const Empty = styled.div`
  flex: 1;
  color: #9aa5b1;
  display: flex;
  justify-content: center;
  align-items: center;
`;
