import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { chatClient, connectClient, disconnectClient } from "../lib/chatClient";

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

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  channels: [],
  unreadChannelCount: 0,
  perChannelUnread: {},

  setUser: (newUser) => {
    AsyncStorage.setItem("user", JSON.stringify(newUser));
    set({ user: newUser });
  },

  setupStreamListeners: () => {
    const updateUnread = () => {
      const channels = get().channels;
      const unreadMap = {};

      channels.forEach((channel) => {
        unreadMap[channel.id] = channel.countUnread();
      });

      set({
        perChannelUnread: unreadMap,
        unreadChannelCount: Object.values(unreadMap).filter((c) => c > 0)
          .length,
      });
    };

    chatClient.off("message.new", updateUnread);
    chatClient.off("notification.message_new", updateUnread);
    chatClient.off("message.read", updateUnread);

    chatClient.on("message.new", updateUnread);
    chatClient.on("notification.message_new", updateUnread);
    chatClient.on("message.read", updateUnread);
  },

  fetchChatChannels: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const result = await chatClient.queryChannels(
        { members: { $in: [user.id] } },
        { last_message_at: -1 },
        { watch: true, state: true }
      );

      const unreadMap = {};
      result.forEach((channel) => {
        unreadMap[channel.id] = channel.countUnread();
      });

      set({
        channels: result,
        perChannelUnread: unreadMap,
        unreadChannelCount: Object.values(unreadMap).filter((c) => c > 0)
          .length,
      });

      get().setupStreamListeners();
    } catch (error) {
      console.error("[fetchChatChannels] Error:", error.message);
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
        await get().fetchChatChannels();
      }
    } catch (error) {
      console.log("Auth check failed", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);
      set({ token: data.token, user: data.user, isLoading: false });

      const streamToken = await getStreamToken(data.token);
      await connectClient(streamToken, data.user);
      await get().fetchChatChannels();

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);
      set({ token: data.token, user: data.user, isLoading: false });

      const streamToken = await getStreamToken(data.token);
      await connectClient(streamToken, data.user);
      await get().fetchChatChannels();

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await disconnectClient();

    set({
      token: null,
      user: null,
      channels: [],
      perChannelUnread: {},
      unreadChannelCount: 0,
    });
  },
}));
