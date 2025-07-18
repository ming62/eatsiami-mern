import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AIreport from "../app/otherpage/more/AIreport";

// Mock WebView to show the report content
jest.mock("react-native-webview", () => {
  const { View, Text } = require("react-native");
  return {
    WebView: ({ source }) => (
      <View testID="mock-webview">
        <Text>{`Rendered HTML: ${source?.html}`}</Text>
      </View>
    ),
  };
});

// Mock auth store
jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user0", username: "me" },
    perChannelUnread: {},
  }),
}));

// Mock API constants
jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

// Mock icons
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});

// Mock image
jest.mock("expo-image", () => ({
  Image: () => null,
}));

// Mock colors
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

// Mock Slider
jest.mock("@react-native-community/slider", () => {
  const { View } = require("react-native");
  return (props) => <View {...props} testID="mock-slider" />;
});

// Mock router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch for report
global.fetch = jest.fn((url) => {
  if (url.endsWith("ai/generate-report")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          aiReport: "<p>Your AI Meal Report</p>",
        }),
    });
  }
  return Promise.reject(new Error("Unhandled fetch URL: " + url));
});

// Test suite
describe("AIreport", () => {
  it("renders slider and Generate Report button", () => {
    const { getByText, getByTestId } = render(<AIreport />);
    expect(getByTestId("mock-slider")).toBeTruthy();
    expect(getByText("Generate Report")).toBeTruthy();
  });

  it("shows AI report when Generate Report is clicked", async () => {
    const { getByText, queryByText } = render(<AIreport />);

    // Initially no report
    expect(queryByText(/Your AI Meal Report/i)).toBeNull();

    // Press button
    fireEvent.press(getByText("Generate Report"));

    // Wait for report to show
    await waitFor(() => expect(getByText(/Your AI Meal Report/i)).toBeTruthy());
  });
});
