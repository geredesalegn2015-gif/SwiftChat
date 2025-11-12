// hooks/useMessageSeenObserver.js
import { useEffect } from "react";
import { socket } from "../../hooks/useSocket";

/**
 * Observes messages in view and marks them as "seen" when visible.
 * Emits "markMessageSeen" to backend.
 */
export function useMessageSeenObserver(selectedChat, localMessages, currentUser) {
  useEffect(() => {
    if (!selectedChat || !currentUser || !localMessages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target;
          const seenBy = target.getAttribute("data-seenby")?.split(",") || [];
          const isSender = target.getAttribute("data-issender") === "true";
          const id = target.getAttribute("data-id");

          // Skip if already seen or sent by self
          if (isSender || seenBy.includes(currentUser._id)) return;

          // Emit socket event to backend
          socket.emit("markMessageSeen", {
            messageId: id,
            chatId: selectedChat._id,
            userId: currentUser._id,
          });

          // Stop observing once seen
          observer.unobserve(target);
        });
      },
      { threshold: 0.6 }
    );

    // Observe all un-seen incoming messages
    const bubbles = document.querySelectorAll(".message-bubble");
    bubbles.forEach((bubble) => {
      const seenBy = bubble.getAttribute("data-seenby")?.split(",") || [];
      const isSender = bubble.getAttribute("data-issender") === "true";
      if (!isSender && !seenBy.includes(currentUser._id)) {
        observer.observe(bubble);
      }
    });

    return () => observer.disconnect();
  }, [localMessages, selectedChat, currentUser]);
}
