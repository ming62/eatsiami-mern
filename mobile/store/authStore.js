import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { connectClient, disconnectClient } from "../lib/chatClient";

async function getStreamToken(token) {
  try {
    const res = await fetch(`${API_URL}/chat/token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to get Stream token");
    const data = await res.json();
    return data.token;
  } catch (err) {
    console.error("[GET STREAM TOKEN] Error:", err.message);
    return null;
  }
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  setUser: (newUser) => {
    AsyncStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      const streamToken = await getStreamToken(data.token);
      await connectClient(streamToken, data.user);

      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.message,
      };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      set({ token, user });

      if (token && user) {
        const streamToken = await getStreamToken(token);
        await connectClient(streamToken, user);
      }
    } catch (error) {
      console.log("Auth check failed", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    console.log("logout now");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await disconnectClient();

    set({ token: null, user: null });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);
      set({ token: data.token, user: data.user, isLoading: false });

      const streamToken = await getStreamToken(data.token);
      await connectClient(streamToken, data.user);
      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.message,
      };
    }
  },
}));
