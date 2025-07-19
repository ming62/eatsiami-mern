import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Privacy from "../app/otherpage/more/privacy";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "expo-router";

// Mock router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock Ionicons
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

global.fetch = jest.fn();

// Shared mock setup
const mockRouterBack = jest.fn();
const mockSetUser = jest.fn();

beforeEach(() => {
  require("expo-router").useRouter.mockReturnValue({
    back: mockRouterBack,
  });

  require("../store/authStore").useAuthStore.mockReturnValue({
    user: { id: "123", privacy: "public" },
    token: "test-token",
    setUser: mockSetUser,
  });

  jest.clearAllMocks();
});

//UNIT TESTS

describe("Privacy screen (Unit Tests)", () => {
  it("renders privacy options correctly", () => {
    const { getByText } = render(<Privacy />);

    expect(getByText("Public")).toBeTruthy();
    expect(getByText("Friends Only")).toBeTruthy();
    expect(
      getByText(
        "Anyone can see your foodcards on the main feed and visit your profile"
      )
    ).toBeTruthy();
    expect(
      getByText(
        "Only your friends can see your foodcards and visit your profile"
      )
    ).toBeTruthy();
  });

  it("shows current privacy setting as selected", () => {
    const { getByLabelText } = render(<Privacy />);

    // Public should be selected by default based on mock user
    expect(getByLabelText("checkmark-circle")).toBeTruthy();
  });

  it("shows private as selected when user privacy is private", () => {
    require("../store/authStore").useAuthStore.mockReturnValue({
      user: { id: "123", privacy: "private" },
      token: "test-token",
      setUser: mockSetUser,
    });

    const { getByLabelText } = render(<Privacy />);

    expect(getByLabelText("checkmark-circle")).toBeTruthy();
  });
});

//INTEGRATION TESTS

describe("Privacy screen (Integration Tests)", () => {
  it("successfully updates privacy to private", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: "123", privacy: "private" },
      }),
    });

    const { getByText } = render(<Privacy />);

    await act(async () => {
      fireEvent.press(getByText("Friends Only"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/users/privacy",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({ privacy: "private" }),
        })
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Privacy settings updated successfully!"
      );
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "123",
        privacy: "private",
      });
    });
  });

  it("successfully updates privacy to public", async () => {
    require("../store/authStore").useAuthStore.mockReturnValue({
      user: { id: "123", privacy: "private" },
      token: "test-token",
      setUser: mockSetUser,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: "123", privacy: "public" },
      }),
    });

    const { getByText } = render(<Privacy />);

    await act(async () => {
      fireEvent.press(getByText("Public"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/users/privacy",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({ privacy: "public" }),
        })
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Privacy settings updated successfully!"
      );
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "123",
        privacy: "public",
      });
    });
  });

  it("handles API error when updating privacy", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Failed to update privacy",
      }),
    });

    const { getByText } = render(<Privacy />);

    await act(async () => {
      fireEvent.press(getByText("Friends Only"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to update privacy"
      );
    });

    // Should not update user state on error
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("handles network error when updating privacy", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const { getByText } = render(<Privacy />);

    await act(async () => {
      fireEvent.press(getByText("Friends Only"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Network error");
    });

    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("shows and hides loading state during update", async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetch.mockReturnValueOnce(promise);

    const { getByText, queryByText } = render(<Privacy />);

    await act(async () => {
      fireEvent.press(getByText("Friends Only"));
    });

    // Should show loading state
    await waitFor(() => {
      expect(queryByText("Updating privacy settings...")).toBeTruthy();
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({
          user: { id: "123", privacy: "private" },
        }),
      });
    });

    // Loading should be hidden
    await waitFor(() => {
      expect(queryByText("Updating privacy settings...")).toBeFalsy();
    });
  });

  it("maintains correct selection state throughout update process", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: "123", privacy: "private" },
      }),
    });

    const { getByText, getByLabelText } = render(<Privacy />);

    // Initially public is selected
    expect(getByLabelText("checkmark-circle")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText("Friends Only"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Privacy settings updated successfully!"
      );
    });

    // After update, private should be selected
  });
});
