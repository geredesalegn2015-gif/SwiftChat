// src/ui/Sidebar.jsx
import styled from "styled-components";
import TopBar from "./TopBar";
import ChatList from "../features/chats/ChatList2";
import { useState } from "react";

export default function Sidebar({ selectedChat, onSelectChat, onToggleDrawer }) {
  const [localChats, setLocalChats] = useState([]);

  const handleStartChat = (newChat) => {
    setLocalChats((prev) => [newChat, ...prev]);
  };

  return (
    <Wrapper>
      <TopBar onToggleDrawer={onToggleDrawer} onStartChat={handleStartChat} />
      <ChatList
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
        localChats={localChats}
      />
    </Wrapper>
  );
}

const Wrapper = styled.aside`
  display: flex;
  flex-direction: column;
  background-color: #17212b;
  border-right: 1px solid #1e2a36;
  height: 100%;
`;
