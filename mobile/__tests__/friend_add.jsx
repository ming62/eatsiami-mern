import { render, waitFor, fireEvent } from "@testing-library/react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Friends from "../app/(tabs)/friends";
import SearchScreen from "../app/otherpage/search";
import { Alert } from "react-native";

// Mock navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user1", username: "testuser" },
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
  starColor: "#f4b400",
}));

// Mock fetch for friends and search endpoints
global.fetch = jest.fn((url, options) => {
  if (url.endsWith("/users/friends")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { _id: "friend1", username: "Ming", profileImage: "" },
        ]),
    });
  }
  if (url.startsWith("http://mock-api/users/search")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { _id: "user2", username: "Alice", profileImage: "" },
        ]),
    });
  }
  if (
    url.endsWith("/users/friend-request/user2") &&
    options &&
    options.method === "POST"
  ) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ message: "Friend request sent successfully!" }),
    });
  }
  if (url.endsWith("/users/outgoing-friend-requests")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

// Mock Alert
beforeAll(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterAll(() => {
  Alert.alert.mockRestore();
});

describe("Friends to Search and Add Friend Flow", () => {
  it("navigates to search page and adds a friend", async () => {
    // Render Friends page
    const { getByLabelText } = render(
      <NavigationContainer>
        <Friends />
      </NavigationContainer>
    );

    // Use the native focus method to trigger navigation
    const searchInput = getByLabelText("search bar");
    searchInput.props.onFocus(); // This triggers the onFocus handler directly

    // Assert navigation was triggered
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("otherpage/search");
    });

    // Render Search page
    const { getByPlaceholderText: getByPlaceholderTextSearch, getByText } = render(
      <NavigationContainer>
        <SearchScreen />
      </NavigationContainer>
    );

    // Type in the search bar
    const searchBar = getByPlaceholderTextSearch("search by username...");
    fireEvent.changeText(searchBar, "Alice");

    // Wait for Alice to appear in results
    await waitFor(() => {
      expect(getByText("Alice")).toBeTruthy();
    });

    // Press the Add button for Alice
    const addButton = getByText("Add");
    fireEvent.press(addButton);

    // Wait for the friend request API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/friend-request/user2"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

