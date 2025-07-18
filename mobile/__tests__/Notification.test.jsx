import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import Notification from "../app/(tabs)/notification";

// Mocks
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
  }),
}));
jest.mock("../store/notificationStore", () => ({
  useNotificationStore: () => ({
    setBadgeCount: jest.fn(),
  }),
}));
jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));
jest.mock("expo-image", () => ({
  Image: (props) => <></>, // Mock image
}));
jest.mock("../lib/utils", () => ({
  formatPublishDate: () => "1h ago",
}));
jest.mock("../hooks/countNotifications", () => ({
  fetchNotificationCount: jest.fn(),
}));

// Global fetch mock
global.fetch = jest.fn((url) => {
  if (url.endsWith("/users/notification")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          pendingFriendReqs: [
            {
              _id: "req1",
              sender: { username: "testuser", profileImage: "http://image" },
              createdAt: new Date().toISOString(),
            },
          ],
          pendingJioReqs: [],
          acceptedFriendReqs: [],
          acceptedJioReqs: [],
          rejectedJioReqs: [],
          commentsOnMyPosts: [],
          repliesToMyComments: [],
        }),
    });
  }

  if (url.includes("/friend-request/req1/accept")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Accepted" }),
    });
  }

  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "Error" }),
  });
});

describe("Notification screen", () => {
  it("renders friend request and handles accept button", async () => {
    const { getByText } = render(<Notification />);

    await waitFor(() => {
      expect(getByText("testuser")).toBeTruthy();
      expect(getByText("sent you a friend request")).toBeTruthy();
    });

    const acceptButton = getByText("Accept");
    fireEvent.press(acceptButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/friend-request/req1/accept"),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });
  });
});
