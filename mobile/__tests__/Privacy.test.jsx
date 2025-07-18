import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Privacy from "../app/otherpage/more/privacy";
import { useAuthStore } from "../store/authStore";
import { Alert } from "react-native";

// Mock router
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

// Mock Ionicons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: () => <></>,
  };
});

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        user: { id: "123", privacy: "public" },
      }),
  })
);

describe("Privacy Screen", () => {
  const setUserMock = jest.fn();
  const user = { id: "123", privacy: "public" };
  const token = "test-token";

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      user,
      token,
      setUser: setUserMock,
    });
    Alert.alert.mockClear();
    setUserMock.mockClear();
    fetch.mockClear();
  });

  it("renders privacy options", () => {
    const { getByText } = render(<Privacy />);
    expect(getByText("Public")).toBeTruthy();
    expect(getByText("Friends Only")).toBeTruthy();
  });

  it("updates privacy to private", async () => {
    const { getByText, queryByText } = render(<Privacy />);
    const privateOption = getByText("Friends Only");

    fireEvent.press(privateOption);

    expect(queryByText("Updating privacy settings...")).toBeTruthy();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/privacy"),
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
          body: JSON.stringify({ privacy: "private" }),
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Privacy settings updated successfully!"
      );
      expect(setUserMock).toHaveBeenCalledWith({
        id: "123",
        privacy: "public",
      });
    });
  });
});
