import { useState } from "react";
import styled from "styled-components";

// ---------------- Styled Components ----------------
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

const FileLabel = styled.label`
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;

  svg {
    fill: #9aa5b1;
    transition: fill 0.2s;
  }

  &:hover svg {
    fill: #ffffff;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// ---------------- File Preview Components ----------------
const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Stack previews vertically */
  gap: 8px;
  padding: 8px 14px 0 14px;
`;

const PreviewImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;

const PreviewFile = styled.div`
  background: #182533;
  color: #a9c4ff;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
`;

const ActionButton = styled.button`
  background: ${({ cancel }) => (cancel ? "#a33" : "#2b5278")};
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    opacity: 0.85;
  }
`;

// ---------------- Component ----------------
export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    onSend({ text: text.trim(), files });
    setText("");
    setFiles([]);
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) setFiles(selectedFiles);
    e.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ---------- File Preview + Cancel/Send ---------- */}
      {files.length > 0 && (
        <PreviewWrapper>
          {files.map((file) => {
            const key = `${file.name}-${file.size}-${file.lastModified}`;
            return file.type.startsWith("image") ? (
              <PreviewImage key={key} src={URL.createObjectURL(file)} alt={file.name} />
            ) : (
              <PreviewFile key={key}>📎 {file.name}</PreviewFile>
            );
          })}

          <PreviewActions>
            <ActionButton cancel type="button" onClick={() => setFiles([])}>
              Cancel
            </ActionButton>
            <ActionButton type="submit">Send</ActionButton>
          </PreviewActions>
        </PreviewWrapper>
      )}

      {/* ---------- Input Container ---------- */}
      <InputContainer>
        <FileLabel>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path d="M16.5 6v11.5a4.5 4.5 0 01-9 0V7a3.5 3.5 0 017 0v9.5a2.5 2.5 0 01-5 0V8h1.5v8.5a1 1 0 002 0V7a2 2 0 00-4 0v10.5a3.5 3.5 0 007 0V6h1.5z" />
          </svg>
          <HiddenFileInput type="file" multiple onChange={handleFileChange} />
        </FileLabel>

        <Input
          type="text"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
          }}
        />

        <SendButton type="submit" disabled={!text.trim() && files.length === 0}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </SendButton>
      </InputContainer>
    </form>
  );
}
