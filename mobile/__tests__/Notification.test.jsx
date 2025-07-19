import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Notification from "../app/(tabs)/notification";

//MOCKS
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../store/notificationStore", () => ({
  useNotificationStore: jest.fn(),
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock("../lib/utils", () => ({
  formatPublishDate: () => "1h ago",
}));

jest.mock("../hooks/countNotifications", () => ({
  fetchNotificationCount: jest.fn(),
}));

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

global.fetch = jest.fn();

//SHARED MOCK SETUP
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockSetBadgeCount = jest.fn();

beforeEach(() => {
  require("expo-router").useRouter.mockReturnValue({
    push: mockRouterPush,
    back: mockRouterBack,
  });

  require("../store/authStore").useAuthStore.mockReturnValue({
    token: "mock-token",
  });

  require("../store/notificationStore").useNotificationStore.mockReturnValue({
    setBadgeCount: mockSetBadgeCount,
  });

  jest.clearAllMocks();
});

const getMockNotificationData = (overrides = {}) => ({
  pendingFriendReqs: [],
  pendingJioReqs: [],
  acceptedFriendReqs: [],
  acceptedJioReqs: [],
  rejectedJioReqs: [],
  commentsOnMyPosts: [],
  repliesToMyComments: [],
  ...overrides,
});

//UNIT TESTS

describe("Notification screen (Unit Tests)", () => {
  it("renders loading indicator initially", () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    const { getByTestId } = render(<Notification />);
    expect(getByTestId("activity-indicator")).toBeTruthy();
  });

  it("shows empty state message when no notifications", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => getMockNotificationData(),
    });

    const { getByText } = render(<Notification />);
    await waitFor(() => {
      expect(getByText("No notifications")).toBeTruthy();
    });
  });

  it("renders friend request section when pending requests exist", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        getMockNotificationData({
          pendingFriendReqs: [
            {
              _id: "1",
              sender: { username: "testuser", profileImage: "mocked.jpg" },
              createdAt: new Date().toISOString(),
            },
          ],
        }),
    });

    const { getByText } = render(<Notification />);

    await waitFor(() => {
      expect(getByText("Friend Requests")).toBeTruthy();
      expect(getByText("testuser")).toBeTruthy();
    });
  });

  it("truncates long usernames", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        getMockNotificationData({
          pendingFriendReqs: [
            {
              _id: "1",
              sender: {
                username: "verylongusername",
                profileImage: "mocked.jpg",
              },
              createdAt: new Date().toISOString(),
            },
          ],
        }),
    });

    const { getByText } = render(<Notification />);
    await waitFor(() => {
      expect(getByText("verylongu...")).toBeTruthy();
    });
  });

  it("shows confirm alert when delete is pressed", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        getMockNotificationData({
          pendingFriendReqs: [
            {
              _id: "1",
              sender: { username: "testuser", profileImage: "mocked.jpg" },
              createdAt: new Date().toISOString(),
            },
          ],
        }),
    });

    const { getByLabelText } = render(<Notification />);

    await waitFor(() => getByLabelText("trash-outline"));

    await act(async () => {
      fireEvent.press(getByLabelText("trash-outline"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Confirm Delete",
      "Are you sure you want to delete this friend request?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Delete" }),
      ])
    );
  });
});

//INTEGRATION TESTS

describe("Notification screen (Integration Tests)", () => {
  it("successfully fetches and displays notifications", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        getMockNotificationData({
          pendingFriendReqs: [
            {
              _id: "req1",
              sender: { username: "testuser", profileImage: "http://image" },
              createdAt: new Date().toISOString(),
            },
          ],
          pendingJioReqs: [
            {
              _id: "jio1",
              sender: { username: "jiouser", profileImage: "http://image" },
              createdAt: new Date().toISOString(),
            },
          ],
        }),
    });

    const { getByText } = render(<Notification />);

    await waitFor(() => {
      expect(getByText("testuser")).toBeTruthy();
      expect(getByText("jiouser")).toBeTruthy();
      expect(getByText("sent you a friend request")).toBeTruthy();
      expect(getByText("jio you for a meal!")).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://mock-api/users/notification",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });

  it("handles friend request acceptance flow", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          getMockNotificationData({
            pendingFriendReqs: [
              {
                _id: "req1",
                sender: { username: "testuser", profileImage: "http://image" },
                createdAt: new Date().toISOString(),
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Accepted" }),
      });

    const { getByText } = render(<Notification />);

    await waitFor(() => getByText("Accept"));

    await act(async () => {
      fireEvent.press(getByText("Accept"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/users/friend-request/req1/accept",
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
