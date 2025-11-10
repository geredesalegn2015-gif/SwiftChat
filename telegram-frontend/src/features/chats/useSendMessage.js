// src/features/chats/useSendMessage.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "../../services/apiMessages";

export function useSendMessage(chatId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => sendMessage(chatId, message),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", chatId]);
    },
  });
}
