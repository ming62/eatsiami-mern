import { render, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import LoginContainer from "../app/(auth)/index";

// Use mockToken for Jest compatibility
let mockLogin;
jest.mock("../store/authStore", () => {
  mockLogin = jest.fn(async () => ({ success: true }));
  return {
    useAuthStore: () => ({
      isLoading: false,
      isCheckingAuth: false,
      login: mockLogin,
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
const mockReplace = jest.fn();
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    SplashScreen: {
      preventAutoHideAsync: jest.fn(),
      hideAsync: jest.fn(),
    },
    Link: ({ children }) => children,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
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

describe("<LoginContainer />", () => {
  it("renders Welcome Back text", () => {
    const { getByText } = render(<LoginContainer />);
    expect(getByText("Welcome Back")).toBeTruthy();
  });

  it("navigates to /tabs on successful login", async () => {
    const { getByText, getByLabelText } = render(<LoginContainer />);
    const emailInput = getByLabelText("email address");
    const passwordInput = getByLabelText("password");
    fireEvent.changeText(emailInput, "limmingyou@gmail.com");
    fireEvent.changeText(passwordInput, "testing");
    const loginButton = getByText("Login");
    fireEvent.press(loginButton);

    expect(mockLogin).toHaveBeenCalledWith("limmingyou@gmail.com", "testing");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/(tabs)");

    });
  });
});