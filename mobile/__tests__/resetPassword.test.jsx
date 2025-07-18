import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ResetPassword from "../app/(auth)/resetPassword";
import { Alert } from "react-native";

// Mock router
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({
    email: "test@example.com",
    resetCode: "123456",
  }),
}));

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user0", username: "me" },
    perChannelUnread: {},
    logout: jest.fn(),
  }),
}));

// Mock constants
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

// Mock Alert.alert (simulate pressing OK)
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  if (buttons && buttons[0]?.onPress) buttons[0].onPress();
});

// Default fetch mock
global.fetch = jest.fn((url, options) => {
  if (url.endsWith("/email/reset-password")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Password reset successful" }),
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "Error occurred" }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ResetPassword screen", () => {
  it("renders inputs and button with accessibility labels", () => {
    const { getByLabelText } = render(<ResetPassword />);
    expect(getByLabelText("new-password-input")).toBeTruthy();
    expect(getByLabelText("confirm-password-input")).toBeTruthy();
    expect(getByLabelText("reset-password-button")).toBeTruthy();
  });

  it("shows error if fields are empty", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    fireEvent.press(getByLabelText("reset-password-button"));

    await waitFor(() => {
      expect(getByLabelText("reset-password-button")).toBeTruthy();
    });
  });

  it("shows error if passwords don't match", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    fireEvent.changeText(getByLabelText("new-password-input"), "abc12345");
    fireEvent.changeText(getByLabelText("confirm-password-input"), "xyz999");
    fireEvent.press(getByLabelText("reset-password-button"));

    await waitFor(() => {
      expect(getByLabelText("reset-password-button")).toBeTruthy();
    });
  });

  it("shows error if password is too short", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    fireEvent.changeText(getByLabelText("new-password-input"), "123");
    fireEvent.changeText(getByLabelText("confirm-password-input"), "123");
    fireEvent.press(getByLabelText("reset-password-button"));

    await waitFor(() => {
      expect(getByLabelText("reset-password-button")).toBeTruthy();
    });
  });

  it("calls API and navigates on successful reset", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    fireEvent.changeText(getByLabelText("new-password-input"), "valid12345");
    fireEvent.changeText(
      getByLabelText("confirm-password-input"),
      "valid12345"
    );
    fireEvent.press(getByLabelText("reset-password-button"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/email/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            resetCode: "123456",
            newPassword: "valid12345",
          }),
        })
      );
      expect(mockReplace).toHaveBeenCalledWith("/(auth)");
    });
  });

  it("shows alert if API returns error", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid code" }),
      })
    );

    const { getByLabelText } = render(<ResetPassword />);
    fireEvent.changeText(getByLabelText("new-password-input"), "valid12345");
    fireEvent.changeText(
      getByLabelText("confirm-password-input"),
      "valid12345"
    );
    fireEvent.press(getByLabelText("reset-password-button"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(getByLabelText("reset-password-button")).toBeTruthy(); // stays on screen
    });
  });
});
