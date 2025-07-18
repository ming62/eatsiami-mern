import { render, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import LoginContainer from "../app/(auth)/index";
import SignUpContainer from "../app/(auth)/signup";

// Mock for register
let mockRegister;
jest.mock("../store/authStore", () => {
  mockRegister = jest.fn(async (username, email, password) => {
    if (!email || !username || !password) {
      return { success: false, error: "Please fill in all fields" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }
    if (password === "mismatch") {
      return { success: false, error: "Passwords do not match" };
    }
    if (email === "used@example.com") {
      return { success: false, error: "Email already in use" };
    }
    return { success: true };
  });
  return {
    useAuthStore: () => ({
      isLoading: false,
      isCheckingAuth: false,
      register: mockRegister,
      login: jest.fn(),
      token: null,
    }),
  };
});

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: (target, prop) => View });
});

jest.mock("expo-font", () => {
  const Font = function () {};
  Font.isLoaded = () => true;
  Font.loadAsync = () => Promise.resolve();
  return { useFonts: () => [true], Font };
});

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    SplashScreen: {
      preventAutoHideAsync: jest.fn(),
      hideAsync: jest.fn(),
    },
    Link: ({ children, href, asChild }) => children,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

jest.mock("../constants/colors", () => ({
  primary: "#000",
  white: "#fff",
  searchBarText: "#222",
  searchBarLabel: "#888",
  searchBarBackground: "#eee",
  lightOrangeText: "#f90",
}));

// Mock Alert
import { Alert } from "react-native";
beforeAll(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterAll(() => {
  Alert.alert.mockRestore();
});

describe("<SignUpContainer /> navigation from LoginContainer", () => {
  it("navigates to signup and completes registration", async () => {
    const { getByText } = render(<LoginContainer />);
    const createAccountLink = getByText("create an account here!");
    fireEvent.press(createAccountLink);

    const { getByLabelText, getByText: getByTextSignUp } = render(<SignUpContainer />);

    const emailInput = getByLabelText("email address");
    const usernameInput = getByLabelText("username");
    const passwordInput = getByLabelText("password");
    const confirmPasswordInput = getByLabelText("confirm password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");

    const signUpButton = getByTextSignUp("Sign Up");
    fireEvent.press(signUpButton);

    expect(mockRegister).toHaveBeenCalledWith("testuser", "test@example.com", "password123");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/otherpage/profilePreview");
    });
  });

  // --- Unit tests for edge cases ---

  it("shows alert if any field is empty", async () => {
    const { getByLabelText, getByText } = render(<SignUpContainer />);
    const emailInput = getByLabelText("email address");
    const usernameInput = getByLabelText("username");
    const passwordInput = getByLabelText("password");
    const confirmPasswordInput = getByLabelText("confirm password");

    fireEvent.changeText(emailInput, "");
    fireEvent.changeText(usernameInput, "");
    fireEvent.changeText(passwordInput, "");
    fireEvent.changeText(confirmPasswordInput, "");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");
    });
  });

  it("shows alert if email is invalid", async () => {
    const { getByLabelText, getByText } = render(<SignUpContainer />);
    const emailInput = getByLabelText("email address");
    const usernameInput = getByLabelText("username");
    const passwordInput = getByLabelText("password");
    const confirmPasswordInput = getByLabelText("confirm password");

    fireEvent.changeText(emailInput, "invalidemail");
    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter a valid email address");
    });
  });

  it("shows alert if passwords do not match", async () => {
    const { getByLabelText, getByText } = render(<SignUpContainer />);
    const emailInput = getByLabelText("email address");
    const usernameInput = getByLabelText("username");
    const passwordInput = getByLabelText("password");
    const confirmPasswordInput = getByLabelText("confirm password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "mismatch");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Passwords do not match");
    });
  });

  it("shows alert if email is already used", async () => {
    const { getByLabelText, getByText } = render(<SignUpContainer />);
    const emailInput = getByLabelText("email address");
    const usernameInput = getByLabelText("username");
    const passwordInput = getByLabelText("password");
    const confirmPasswordInput = getByLabelText("confirm password");

    fireEvent.changeText(emailInput, "used@example.com");
    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmPasswordInput, "password123");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Email already in use");
    });
  });
});