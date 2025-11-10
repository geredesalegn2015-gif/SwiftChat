// src/ui/TopBar.jsx
import styled from "styled-components";
import { FaBars } from "react-icons/fa";
import Search from "./Search";

export default function TopBar({ onToggleDrawer, onStartChat }) {
  return (
    <Header>
      <LeftSection>
        <IconButton onClick={onToggleDrawer}>
          <FaBars />
        </IconButton>
        <Title>Telegram</Title>
      </LeftSection>
      <Search onStartChat={onStartChat} />
    </Header>
  );
}

// ---------------- styled-components ----------------

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0e1621;
  border-bottom: 1px solid #1e2a36;
  padding: 0.8rem 1rem;
  height: 56px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #9aa5b1;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #ffffff;
  }
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
`;
