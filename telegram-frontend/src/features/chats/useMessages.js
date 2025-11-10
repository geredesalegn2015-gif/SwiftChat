// src/features/messages/useMessages.js
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../../services/apiMessages";

export function useMessages(chatId, { page = 1, enabled = true } = {}) {
  return useQuery({
    queryKey: ["messages", chatId, page],
    queryFn: () => getMessages(chatId, page),
    enabled: !!chatId && enabled,
    keepPreviousData: true,
  });
}
