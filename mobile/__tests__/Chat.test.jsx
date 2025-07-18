import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Friends from "../app/(tabs)/friends";

// Mock router navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({ friendId: "friend1" }),
}));

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user0", username: "me" },
    perChannelUnread: {},
  }),
}));

// Mock constants and dependencies
jest.mock("../constants/api", () => ({ API_URL: "http://mock-api" }));
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("../constants/colors", () => ({
  primary: "#000",
  white: "#fff",
  background: "#fff",
  textSecondary: "#888",
  cardBackground: "#fff",
  border: "#eee",
  black: "#000",
  textPrimary: "#222",
}));

// Mock fetch responses
global.fetch = jest.fn((url) => {
  if (url.includes("/users/friends")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "friend123",
            username: "FriendUser",
            profileImage: "https://example.com/friend.png",
          },
        ]),
    });
  }
  if (url.includes("/users/outgoing-jio-requests")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
});

describe("Friends screen", () => {
  it("renders friend card, shows jio button, and navigates to chat page on chat press", async () => {
    const { findByText, getByLabelText } = render(<Friends />);

    // Wait for friend name to appear
    const friendName = await findByText("FriendUser");
    expect(friendName).toBeTruthy();

    // Find chat button and press it
    const chatButton = getByLabelText("chat-button-FriendUser");
    fireEvent.press(chatButton);

    // Expect navigation to chat page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/otherpage/chatPage",
        params: {
          friendId: "friend123",
          friendName: "FriendUser",
          friendImage: "https://example.com/friend.png",
        },
      });
    });

    // Jio button should exist
    const jioButton = getByLabelText("jio-button-FriendUser");
    expect(jioButton).toBeTruthy();
  });
});
