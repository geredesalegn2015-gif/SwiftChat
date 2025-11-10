import { useState } from "react";
import styled from "styled-components";

const InputContainer = styled.div`
  
  display: flex;
  align-items: center;
  background: #0e1621;
  padding: 10px 14px;
  border-top: 1px solid #1e2a36;
`;

const Input = styled.input`
  flex: 1;
  background: #17212b;
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 20px;
  font-size: 15px;
  outline: none;

  &::placeholder {
    color: #9aa5b1;
  }
`;

const SendButton = styled.button`
  background: ${({ disabled }) => (disabled ? "#2b3743" : "#2b5278")};
  border: none;
  margin-left: 10px;
  padding: 8px;
  border-radius: 50%;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  svg {
    fill: ${({ disabled }) => (disabled ? "#64727f" : "#fff")};
  }

  &:hover {
    background: ${({ disabled }) => (disabled ? "#2b3743" : "#3b6c9a")};
  }
`;

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText(""); // clear input
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputContainer>
        <Input
          type="text"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
        />

        <SendButton type="submit" disabled={!text.trim()}>
          {/* ✅ Inline SVG for the "Send" icon (paper-plane style) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </SendButton>
      </InputContainer>
    </form>
  );
}
