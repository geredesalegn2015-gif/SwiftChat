import styled from "styled-components";
import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import { useChatWindow } from "./useChatWindow";

/*
  ChatWindow
  - Renders messages saved in localMessages (from useChatWindow)
  - Supports messages with m.media (array of { url, type, name, size })
  - Keeps your styling exactly the same.
*/

export default function ChatWindow({ selectedChat }) {
  const { localMessages, handleSend } = useChatWindow(selectedChat);
  const messagesEndRef = useRef(null);
const SERVER_URL = "http://localhost:8000";
const resolveUrl = (url) => url.startsWith("http") ? url : `${SERVER_URL}${url.replace(/^\/uploads/, "")}`;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  if (!selectedChat) return <Empty>Select a chat to start messaging</Empty>;

  return (
    <Container>
      {/* Header */}
      <Header>
        <Avatar src={selectedChat?.avatar || "/default-avatar.png"} alt="avatar" />
        <HeaderInfo>
          <ChatTitle>{selectedChat?.name || "Chat"}</ChatTitle>
          <StatusText>{selectedChat?.isOnline ? "online" : "last seen recently"}</StatusText>
        </HeaderInfo>
      </Header>

      {/* Messages */}
      <MessagesWrap>
        {localMessages.map((m) => (
          <MessageRow key={m._id} isSender={m.isMine}>
            {!m.isMine && <SmallAvatar src={selectedChat?.avatar || "/default-avatar.png"} alt="avatar" />}

            <MessageBubble isSender={m.isMine}>
              {/* Render media (if any) — uses your message model "media" */}
              {m.media && m.media.length > 0 &&
                m.media.map((file, i) =>
                  file.type === "image" ? (

                    // If file.url is relative (starts with '/uploads/...') add server origin
                    
                   <FileImage key={i} src={resolveUrl(file.url)} alt={file.name} />

                  ) : (
                    <FileLink
                      key={i}
                      href={file.url.startsWith("http") ? file.url : `http://localhost:8000${file.url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 {file.name}
                    </FileLink>
                  )
                )}

              {/* Render text part of the message */}
              {m.text && <div>{m.text}</div>}

              {/* Meta info (time and seen) */}
              <MetaInfo isSender={m.isMine}>
                <TimeText>
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </TimeText>
                {m.isMine && <SeenMark seen={m.seen}>{m.seen ? "✓✓" : "✓"}</SeenMark>}
              </MetaInfo>
            </MessageBubble>
          </MessageRow>
        ))}
        <div ref={messagesEndRef} />
      </MessagesWrap>

      {/* Message input — unchanged styling */}
      <MessageInput onSend={handleSend} />
    </Container>
  );
}

// ---------------- Styled Components ----------------
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #0e1621;
  height: 100vh;
`;

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
  justify-content: ${({ isSender }) => (isSender ? "flex-end" : "flex-start")};
  gap: 6px;
`;

const SmallAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;

const MessageBubble = styled.div`
  position: relative;
  align-self: ${({ isSender }) => (isSender ? "flex-end" : "flex-start")};
  background: ${({ isSender }) => (isSender ? "#2b5278" : "#182533")};
  color: #fff;
  border-radius: 16px;
  padding: 10px 14px;
  max-width: 70%;
  word-wrap: break-word;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    ${({ isSender }) => (isSender ? "right: -6px;" : "left: -6px;")}
    width: 12px;
    height: 12px;
    background: ${({ isSender }) => (isSender ? "#2b5278" : "#182533")};
    clip-path: polygon(0 100%, 100% 100%, 100% 0);
  }
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: ${({ isSender }) => (isSender ? "flex-end" : "flex-start")};
  align-items: center;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ isSender }) => (isSender ? "#d0e4ff" : "#9aa5b1")};
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

const FileImage = styled.img`
  max-width: 200px;
  border-radius: 10px;
  margin-bottom: 5px;
`;

const FileLink = styled.a`
  color: #a9c4ff;
  text-decoration: underline;
  word-break: break-all;
`;
