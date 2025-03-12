import api from "@/lib/api";

type User = {
  id: number;
  email: string;
  username: string;
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

export const register = async (data: {
  email: string;
  password: string;
  username: string;
}) => {
  const response = await api.post("/auth/register", { ...data });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", { ...data });
  return response.data as AuthResponse;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};
