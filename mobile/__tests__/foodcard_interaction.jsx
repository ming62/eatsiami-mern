import { render, waitFor, fireEvent } from "@testing-library/react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";
import CardDetail from "../app/otherpage/cardDetail";

// Remove the FriendsWindow mock so the real modal is rendered
// jest.mock("../components/FriendsWindow", () => () => null);

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
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useLocalSearchParams: () => ({ cardId: "card1" }),
}));

global.fetch = jest.fn((url, options) => {
  if (url.endsWith("/foodcards/card1")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          _id: "card1",
          title: "Test Card",
          caption: "A test card",
          location: "Canteen",
          tag: "lunch",
          rating: 4,
          image: "mock-image-uri",
          user: { _id: "user1", username: "testuser", privacy: "public" },
          isSaved: false,
        }),
    });
  }
  if (url.endsWith("/comments/card1")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "comment1",
            userId: { _id: "user2", username: "commenter", profileImage: "" },
            content: "Nice card!",
            createdAt: new Date().toISOString(),
            replies: [],
          },
        ]),
    });
  }
  if (url.endsWith("/comments") && options && options.method === "POST") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Commented!" }),
    });
  }
  if (url.endsWith("/users/friends")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { _id: "friend1", username: "Ming", profileImage: "" },
        ]),
    });
  }
  if (url.endsWith("/chat/share-foodcard")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Shared!" }),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

// Mock Alert for delete and share
beforeAll(() => {
  jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
    if (Array.isArray(buttons)) {
      const destructive = buttons.find((b) => b.style === "destructive");
      if (destructive && destructive.onPress) destructive.onPress();
      // For share success, just call onPress of the first button
      if (buttons[0] && buttons[0].onPress) buttons[0].onPress();
    }
  });
});
afterAll(() => {
  Alert.alert.mockRestore();
});

describe("Foodcard CardDetail Display", () => {
  it("shows the card details", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(getByText("Test Card")).toBeTruthy();
    });
  });

  it("shows save button and calls save API when pressed (not owner)", async () => {
    // Mock fetch to return a card owned by someone else
    global.fetch.mockImplementationOnce((url) => {
      if (url.endsWith("/foodcards/card1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              _id: "card1",
              title: "Test Card",
              user: {
                _id: "otherUser",
                username: "someone",
                privacy: "public",
              },
              isSaved: false,
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByLabelText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );

    // Wait for the save button to appear
    const saveButton = await waitFor(() => getByLabelText("action button"));
    fireEvent.press(saveButton);

    // Check that the save endpoint was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/save-foodcard/card1"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows delete button and calls delete API when pressed (owner)", async () => {
    global.fetch.mockImplementationOnce((url, options) => {
      if (url.endsWith("/foodcards/card1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              _id: "card1",
              title: "Test Card",
              user: { _id: "user1", username: "testuser", privacy: "public" },
              isSaved: false,
            }),
        });
      }
      // Simulate delete endpoint
      if (
        url.endsWith("/foodcards/card1") &&
        options &&
        options.method === "DELETE"
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Deleted!" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByLabelText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );

    // Wait for the delete button to appear
    const deleteButton = await waitFor(() => getByLabelText("action button"));
    fireEvent.press(deleteButton);

    // Check that the delete endpoint was called
    await waitFor(() => {
      const wasDeleteCalled = global.fetch.mock.calls.some(
        ([url, options]) =>
          url.includes("/foodcards/card1") &&
          options &&
          options.method === "DELETE"
      );
      expect(wasDeleteCalled).toBe(true);
    });
  });

  it("displays a comment", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(getByText("Nice card!")).toBeTruthy();
    });
  });

  it("can comment on the card", async () => {
    const { getByPlaceholderText, getByLabelText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(getByPlaceholderText("Add a comment...")).toBeTruthy();
    });
    fireEvent.changeText(getByPlaceholderText("Add a comment..."), "Great!");
    fireEvent.press(getByLabelText("send comment"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/comments"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("can open share window and share to a friend", async () => {
    // Unmock FriendsWindow for this test if it was mocked globally
    // jest.unmock("../components/FriendsWindow");
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <CardDetail />
      </NavigationContainer>
    );
    // Open share window
    const shareButton = await waitFor(() => getByLabelText("share"));
    fireEvent.press(shareButton);

    // Wait for friend to appear and press to share
    const friend = await waitFor(() => getByText("Ming"));
    fireEvent.press(friend);

    // Check that the share endpoint was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/share-foodcard"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});