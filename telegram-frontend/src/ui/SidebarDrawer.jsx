// src/features/sidebar/SidebarDrawer.jsx
import  { useEffect } from "react";
import {
  DrawerContainer,
  Overlay,
  ProfileSection,
  Avatar,
  Name,
  Phone,
  MenuList,
  MenuItem,
  Icon,
  Label,
} from "./SidebarDrawer.styled";
import {
  FaUser,
  FaUsers,
  FaPhone,
  FaBookmark,
  FaCog,
  FaUserPlus,
  FaQuestionCircle,
} from "react-icons/fa";

const SidebarDrawer = ({ open, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      <DrawerContainer open={open}>
        <ProfileSection>
          <Avatar>GD</Avatar>
          <Name>Gebreslassie Desalegn</Name>
          <Phone>+251 930915857</Phone>
        </ProfileSection>

        <MenuList>
          <MenuItem><Icon><FaUser /></Icon><Label>My Profile</Label></MenuItem>
          <MenuItem><Icon><FaUsers /></Icon><Label>New Group</Label></MenuItem>
          <MenuItem><Icon><FaPhone /></Icon><Label>Calls</Label></MenuItem>
          <MenuItem><Icon><FaBookmark /></Icon><Label>Saved Messages</Label></MenuItem>
          <MenuItem><Icon><FaCog /></Icon><Label>Settings</Label></MenuItem>
        </MenuList>

        <MenuList>
          <MenuItem><Icon><FaUserPlus /></Icon><Label>Invite Friends</Label></MenuItem>
          <MenuItem><Icon><FaQuestionCircle /></Icon><Label>Telegram Features</Label></MenuItem>
        </MenuList>
      </DrawerContainer>

      {open && <Overlay onClick={onClose} />}
    </>
  );
};

export default SidebarDrawer;
