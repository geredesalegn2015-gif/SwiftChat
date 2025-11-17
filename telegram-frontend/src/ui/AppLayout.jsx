// src/ui/AppLayout.jsx
import { useState } from "react";
import styled from "styled-components";
import SidebarDrawer from "./SidebarDrawer";
import Sidebar from "./Sidebar";
import ChatWindow from "../features/chats/ChatWindow2";

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <Layout>
      {/* Hidden by default, slides in when opened */}
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <ChatListColumn>
        <Sidebar
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onToggleDrawer={() => setDrawerOpen(true)}
        />
      </ChatListColumn>

      <ChatColumn>
        <ChatWindow selectedChat={selectedChat} />
      </ChatColumn>
    </Layout>
  );
}

// ---------------- styled-components ----------------

const Layout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  height: 100vh;
  background-color: #0e1621;
  color: #fff;
  overflow: hidden;
`;

const ChatListColumn = styled.aside`
  background: #17212b;
  border-right: 1px solid #1e2a36;
  display: flex;
  flex-direction: column;
`;

const ChatColumn = styled.section`
  background: #0e1621;
  display: flex;
  flex-direction: column;
`;
