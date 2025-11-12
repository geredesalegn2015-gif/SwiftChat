// src/features/messages/useMessages.js
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../../services/apiMessages";

export function useMessages(chatId, token, {  enabled = true } = {}) {
  return useQuery({
    queryKey: ["messages", chatId, token],
    queryFn: () => getMessages(chatId, token), // Pass token to API call
    enabled: !!chatId && !!token && enabled, // Also require token
    keepPreviousData: true,
  });
}