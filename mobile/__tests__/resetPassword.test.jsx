import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ResetPassword from "../app/(auth)/resetPassword";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../store/authStore";

//MOCKS
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

global.fetch = jest.fn();

//SHARED MOCK SETUP
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
const mockLogout = jest.fn();

beforeEach(() => {
  require("expo-router").useRouter.mockReturnValue({
    back: mockRouterBack,
    replace: mockRouterReplace,
  });

  require("expo-router").useLocalSearchParams.mockReturnValue({
    email: "test@example.com",
    resetCode: "123456",
  });

  require("../store/authStore").useAuthStore.mockReturnValue({
    logout: mockLogout,
  });

  jest.clearAllMocks();
});

//UNIT TESTS

describe("ResetPassword screen (Unit Tests)", () => {
  it("renders password inputs and button correctly", () => {
    const { getByLabelText, getAllByText, getByText } = render(
      <ResetPassword />
    );

    expect(getByLabelText("new-password-input")).toBeTruthy();
    expect(getByLabelText("confirm-password-input")).toBeTruthy();
    expect(getByLabelText("reset-password-button")).toBeTruthy();
    expect(getAllByText("Reset Password")).toHaveLength(2);
    expect(getByText("Enter your new password")).toBeTruthy();
  });

  it("toggles password visibility", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    const toggleButton = getByLabelText("toggle-password-visibility");

    await act(async () => {
      fireEvent.press(toggleButton);
    });

    expect(toggleButton).toBeTruthy();
  });

  it("toggles confirm password visibility", async () => {
    const { getByLabelText } = render(<ResetPassword />);
    const toggleButton = getByLabelText("toggle-confirm-password-visibility");

    await act(async () => {
      fireEvent.press(toggleButton);
    });

    expect(toggleButton).toBeTruthy();
  });

  it("disables button when fields are empty", () => {
    const { getByLabelText } = render(<ResetPassword />);
    const button = getByLabelText("reset-password-button");

    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it("enables button when both fields are filled", async () => {
    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("new-password-input"), "password123");
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "password123"
      );
    });

    const button = getByLabelText("reset-password-button");
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it("shows error if passwords don't match", async () => {
    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("new-password-input"), "password123");
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "differentpassword"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Passwords do not match"
      );
    });
  });

  it("shows error if password is too short", async () => {
    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("new-password-input"), "123");
      fireEvent.changeText(getByLabelText("confirm-password-input"), "123");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Password must be at least 6 characters"
      );
    });
  });
});

//INTEGRATION TESTS

describe("ResetPassword screen (Integration Tests)", () => {
  it("successfully resets password and navigates", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Password reset successful",
      }),
    });

    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(
        getByLabelText("new-password-input"),
        "validpassword123"
      );
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "validpassword123"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/email/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            email: "test@example.com",
            resetCode: "123456",
            newPassword: "validpassword123",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Password reset successful! Please login with your new password.",
        expect.arrayContaining([
          expect.objectContaining({
            text: "OK",
            onPress: expect.any(Function),
          }),
        ])
      );
    });
  });

  it("handles API error when resetting password", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Invalid reset code",
      }),
    });

    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(
        getByLabelText("new-password-input"),
        "validpassword123"
      );
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "validpassword123"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid reset code");
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("handles network error when resetting password", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(
        getByLabelText("new-password-input"),
        "validpassword123"
      );
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "validpassword123"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Network error. Please try again."
      );
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("shows and hides loading state during password reset", async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetch.mockReturnValueOnce(promise);

    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(
        getByLabelText("new-password-input"),
        "validpassword123"
      );
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "validpassword123"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    const button = getByLabelText("reset-password-button");
    expect(button.props.accessibilityState?.disabled).toBe(true);

    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({
          message: "Password reset successful",
        }),
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it("executes logout and navigation on successful alert confirmation", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Password reset successful",
      }),
    });

    Alert.alert.mockImplementation((title, message, buttons) => {
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    });

    const { getByLabelText } = render(<ResetPassword />);

    await act(async () => {
      fireEvent.changeText(
        getByLabelText("new-password-input"),
        "validpassword123"
      );
      fireEvent.changeText(
        getByLabelText("confirm-password-input"),
        "validpassword123"
      );
    });

    await act(async () => {
      fireEvent.press(getByLabelText("reset-password-button"));
    });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith("/(auth)");
    });
  });
});
