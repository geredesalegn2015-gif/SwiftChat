// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiUsers from "../services/apiUsers";

/**
 * Fetch current user profile
 * @param {string} token - Auth token
 */
export const useGetMe = (token) => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiUsers.getMe(token),
    enabled: !!token, // Only fetch if token exists
  });
};

/**
 * Update current user profile
 * @param {string} token - Auth token
 */
export const useUpdateMe = (token) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => apiUsers.updateMe(formData, token),
    onSuccess: () => {
      // Refetch profile after update
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
