import { render, waitFor, fireEvent } from "@testing-library/react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Friends from "../app/(tabs)/friends";
import FriendDetail from "../app/otherpage/friendDetail";

// Mock navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({ friendId: "friend1" }),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user0", username: "me" },
    perChannelUnread: {},
  }),
}));
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

global.fetch = jest.fn((url) => {
  if (url.endsWith("/users/friends")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { _id: "friend1", username: "Ming", profileImage: "img1" },
        ]),
    });
  }
  if (url.endsWith("/users/friend1")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          _id: "friend1",
          username: "Ming",
          profileImage: "img1",
        }),
    });
  }
  if (url.endsWith("/foodcards/user/friend1")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "foodcard1",
            title: "Ming's Foodcard",
            image: "img-foodcard",
          },
        ]),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

describe("Friend detail navigation and display", () => {
  it("navigates to friend detail and displays friend and their foodcard", async () => {
    // Render Friends page
    const { getByText } = render(
      <NavigationContainer>
        <Friends />
      </NavigationContainer>
    );

    // Wait for friend to appear and press to navigate
    const friend = await waitFor(() => getByText("Ming"));
    fireEvent.press(friend);

    const { getByText: getByTextDetail } = render(
      <NavigationContainer>
        <FriendDetail />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByTextDetail("Ming")).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByTextDetail("Ming's Foodcard")).toBeTruthy();
    });
  });

  it("shows 'No foodcards found.' if friend has no foodcards", async () => {
    // Mock fetch to return no foodcards for friend1
    global.fetch.mockImplementation((url) => {
      if (url.endsWith("/users/friends")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { _id: "friend1", username: "Ming", profileImage: "img1" },
            ]),
        });
      }
      if (url.endsWith("/users/friend1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              _id: "friend1",
              username: "Ming",
              profileImage: "img1",
            }),
        });
      }
      if (url.endsWith("/foodcards/user/friend1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // No foodcards
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByText } = render(
      <NavigationContainer>
        <FriendDetail />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText("No foodcards found.")).toBeTruthy();
    });
  });

  it("shows private account message if friend foodcards API returns 403", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.endsWith("/users/friends")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { _id: "friend1", username: "Ming", profileImage: "img1" },
            ]),
        });
      }
      if (url.endsWith("/users/friend1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              _id: "friend1",
              username: "Ming",
              profileImage: "img1",
            }),
        });
      }
      if (url.endsWith("/foodcards/user/friend1")) {
        return Promise.resolve({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ message: "Private account" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByText } = render(
      <NavigationContainer>
        <FriendDetail />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText("This is a private account.")).toBeTruthy();
      expect(getByText("Add friend to view food cards.")).toBeTruthy();
    });
  });
});
