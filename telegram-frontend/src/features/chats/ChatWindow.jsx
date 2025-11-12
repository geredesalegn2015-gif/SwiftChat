// ChatWindow.jsx
import styled from "styled-components";
import { useRef, useEffect } from "react";
import MessageInput from "./MessageInput";
import { useChatWindow } from "./useChatWindow";
import { useAuth } from "../../context/useAuth";
import { useMessageSeenObserver } from "./useMessageSeenObserver";

/**
 * ChatWindow Component
 * - Displays chat messages
 * - Auto-scrolls to bottom on new messages
 * - Marks messages as seen when visible
 * - Uses WebSocket for real-time send, receive, and seen status
 */
export default function ChatWindow({ selectedChat }) {
  const { user: currentUser } = useAuth();

  // useChatWindow hook handles socket-based message fetching and sending
  const { localMessages, handleSend, setLocalMessages } = useChatWindow(selectedChat);

  const messagesEndRef = useRef(null);

  // Hook that observes message bubbles and emits "markMessageSeen" via socket
  useMessageSeenObserver(selectedChat, localMessages, currentUser, setLocalMessages);

  // Scroll only when *new* messages arrive (not on initial chat switch)
const hasMounted = useRef(false);

useEffect(() => {
  if (!messagesEndRef.current) return;

  if (!hasMounted.current) {
    // Skip scroll on first load (when user opens a chat)
    hasMounted.current = true;
    return;
  }

  // Scroll to bottom when new messages are appended
  messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
}, [localMessages.length]);


  if (!selectedChat) return <Empty>Select a chat to start messaging</Empty>;

  const SERVER_URL = "http://localhost:8000";

  const resolveUrl = (url) =>
    url.startsWith("http") ? url : `${SERVER_URL}${url.replace(/^\/uploads/, "")}`;

  // Check if the other participant has seen the message
  const hasOtherParticipantSeenMessage = (message) => {
    if (!Array.isArray(message.seenBy)) return false;
    if (selectedChat.type === "private") {
      const other = selectedChat.participants.find((p) => p._id !== currentUser._id);
      return message.seenBy.includes(other?._id);
    }
    return message.seenBy.length > 0;
  };

  return (
    <Container>
      {/* Chat header */}
      <Header>
        <Avatar src={selectedChat?.avatar || "/default-avatar.png"} alt="avatar" />
        <HeaderInfo>
          <ChatTitle>{selectedChat?.name || "Chat"}</ChatTitle>
          <StatusText>{selectedChat?.isOnline ? "online" : "last seen recently"}</StatusText>
        </HeaderInfo>
      </Header>

      {/* Chat body */}
      <MessagesWrap>
        {localMessages.map((m) => (
          <MessageRow key={m._id} isSender={m.isMine}>
            {!m.isMine && (
              <SmallAvatar src={selectedChat?.avatar || "/default-avatar.png"} alt="avatar" />
            )}

            <MessageBubble
              className="message-bubble"
              data-id={m._id}
              data-seenby={m.seenBy ? m.seenBy.join(",") : ""}
              data-issender={String(m.isMine)}
              isSender={m.isMine}
            >
              {/* Media attachments */}
              {m.media?.length > 0 &&
                m.media.map((file, i) =>
                  file.type === "image" ? (
                    <FileImage key={i} src={resolveUrl(file.url)} alt={file.name} />
                  ) : (
                    <FileLink
                      key={i}
                      href={resolveUrl(file.url)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 {file.name}
                    </FileLink>
                  )
                )}

              {/* Text message */}
              {m.text && <div>{m.text}</div>}

              {/* Timestamp and seen mark */}
              <MetaInfo isSender={m.isMine}>
                <TimeText>
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TimeText>
                {m.isMine && (
                  <SeenMark seen={hasOtherParticipantSeenMessage(m)}>
                    {hasOtherParticipantSeenMessage(m) ? "✓✓" : "✓"}
                  </SeenMark>
                )}
              </MetaInfo>
            </MessageBubble>
          </MessageRow>
        ))}
        <div ref={messagesEndRef} />
      </MessagesWrap>

      {/* Input area */}
      <MessageInput onSend={handleSend} />
    </Container>
  );
}

/* ---------------- Styled Components ---------------- */
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
