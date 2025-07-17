import { render, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import LoginContainer from "../app/(auth)/index";
import SignUpContainer from "../app/(auth)/signup";

// Mock for register
let mockRegister;
jest.mock("../store/authStore", () => {
  mockRegister = jest.fn(async () => ({ success: true }));
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
});