import styled from "styled-components";

export const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  left: ${({ open }) => (open ? "0" : "-300px")};
  width: 300px;
  height: 100vh;
  background-color: #fff;
  box-shadow: ${({ open }) => (open ? "2px 0 10px rgba(0,0,0,0.3)" : "none")};
  transition: left 0.3s ease;
  z-index: 1001;
  overflow-y: auto;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

export const ProfileSection = styled.div`
  background-color: #5682a3;
  color: white;
  padding: 2rem 1.5rem;
`;

export const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #76a7c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 0.75rem;
`;

export const Name = styled.h3`
  font-size: 1.1rem;
  margin: 0;
`;

export const Phone = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
`;

export const MenuList = styled.ul`
  list-style: none;
  padding: 0.75rem 0;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
`;

export const MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  color: #333;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const Icon = styled.span`
  margin-right: 1rem;
  font-size: 1.1rem;
  color: #6b7280;
`;

export const Label = styled.span`
  font-size: 0.95rem;
`;
