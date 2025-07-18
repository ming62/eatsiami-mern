import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPassword from "../app/(auth)/forgotPassword";
import * as ExpoRouter from "expo-router";

// Mock router
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.spyOn(ExpoRouter, "useRouter").mockReturnValue({
  back: mockBack,
  push: mockPush,
});
jest.spyOn(ExpoRouter, "useLocalSearchParams").mockReturnValue({
  cardId: "card1",
});

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({ user: { email: "test@example.com" } }),
}));

// Mock API URL
jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

// Mock Ionicons
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
  };
});

// Global fetch mock
global.fetch = jest.fn((url) => {
  if (url.endsWith("/email/forgot-password")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Code sent" }),
    });
  }
  if (url.endsWith("/email/verify-reset-code")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Verified" }),
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "Error" }),
  });
});

describe("ForgotPassword", () => {
  it("renders with prefilled email", () => {
    const { getByDisplayValue, getByText } = render(<ForgotPassword />);
    expect(getByDisplayValue("test@example.com")).toBeTruthy();
    expect(getByText("Send Reset Code")).toBeTruthy();
  });

  it("sends reset code and advances to step 2", async () => {
    const { getByText } = render(<ForgotPassword />);
    fireEvent.press(getByText("Send Reset Code"));

    await waitFor(() => {
      expect(getByText(/Enter the 6-digit code/i)).toBeTruthy();
    });
  });

  it("verifies code and navigates to resetPassword screen", async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPassword />);
    fireEvent.press(getByText("Send Reset Code"));

    await waitFor(() => {
      expect(getByText(/Enter the 6-digit code/i)).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText("000000"), "123456");
    fireEvent.press(getByText("Verify Code"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(auth)/resetPassword",
        params: { email: "test@example.com", resetCode: "123456" },
      });
    });
  });

  it("shows resend countdown", async () => {
    const { getByText } = render(<ForgotPassword />);
    fireEvent.press(getByText("Send Reset Code"));

    await waitFor(() => {
      expect(getByText(/Resend in/i)).toBeTruthy();
    });
  });
});
