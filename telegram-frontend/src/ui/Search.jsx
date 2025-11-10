// src/ui/Search.jsx
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { searchUsers } from "../services/apiUsers"; // new service
import { accessPrivateChat } from "../services/apiChats";
import { useAuth } from "../context/useAuth";

const Form = styled.form`
  flex: 0 0 70%;
  display: flex;
  align-items: center;
  position: relative;
`;

const Input = styled.input`
  font-family: inherit;
  font-size: inherit;
  background-color: var(--color-grey-50);
  border: none;
  color: var(--color-grey-600);
  padding: 0.7rem 2rem;
  border-radius: 10rem;
  width: 90%;
  transition: all 0.2s;
  margin-right: -3.25rem;

  &:focus {
    outline: none;
    width: 100%;
  }
`;

const Button = styled.button`
  background-color: var(--color-grey-50);
  border: none;
  cursor: pointer;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-600);
  }
`;

const Results = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  right: 0;
  background: #1e2a35;
  border-radius: 10px;
  z-index: 100;
  padding: 0.5rem;
`;

const ResultItem = styled.div`
  padding: 0.5rem 1rem;
  color: white;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #2b5278;
  }
`;

export default function Search({ onStartChat }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { token } = useAuth();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const users = await searchUsers(query, token);
      console.log("users by search",users)
      setResults(users);
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  async function handleStartChat(userId) {
    try {
      const newChat =  await accessPrivateChat(userId, token);
      onStartChat?.(newChat);
      setResults([]);
      setQuery("");
    } catch (err) {
      console.error("Chat creation failed:", err);
    }
  }

  return (
    <Form onSubmit={handleSearch}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      <Button type="submit">
        <FaSearch />
      </Button>

      {results.length > 0 && (
        <Results>
          {results.map((user) => (
            <ResultItem key={user._id} onClick={() => handleStartChat(user._id)}>
              {user.fullName}
            </ResultItem>
          ))}
        </Results>
      )}
    </Form>
  );
}
