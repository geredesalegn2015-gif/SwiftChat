// src/features/chats/useChats.js
import { useQuery } from "@tanstack/react-query";
import {useAuth} from "../../context/useAuth"
import { getMyChats } from "../../services/apiChats";

export function useChats() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["chats", token],
    queryFn: () => getMyChats(token),
    enabled: !!token, // only run if token exists
    staleTime: 1000 * 60 * 2,
  });
}
