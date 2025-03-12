import { getMe, login, logout } from "@/services/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => await getMe(),
    staleTime: 1000 * 60 * 60 * 24,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: { email: string; password: string }) => {
      return await login(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      if (data) {
        const token = data.accessToken;
        localStorage.setItem("token", token);
      }
    },
  });
};

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await logout(),
    onSuccess: () => queryClient.setQueryData(["user"], null),
  });
}
