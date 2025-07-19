import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AIreport from "../app/otherpage/more/AIreport";

// === MOCKS ===
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

jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
    user: { id: "user0", username: "me" },
    perChannelUnread: {},
  }),
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

jest.mock("@react-native-community/slider", () => {
  const { View } = require("react-native");
  return (props) => <View {...props} testID="mock-slider" />;
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch
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

// UNIT TESTS
describe("AIreport - Unit Tests", () => {
  it("renders the slider component", () => {
    const { getByTestId } = render(<AIreport />);
    expect(getByTestId("mock-slider")).toBeTruthy();
  });

  it("renders the Generate Report button", () => {
    const { getByText } = render(<AIreport />);
    expect(getByText("Generate Report")).toBeTruthy();
  });

  it("shows appropriate message when no food cards exist in time range", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            aiReport: "<p>No meals found in the selected time range</p>",
          }),
      })
    );

    const { getByText, queryByText } = render(<AIreport />);
    fireEvent.press(getByText("Generate Report"));

    await waitFor(() =>
      expect(
        getByText(/No meals found in the selected time range/i)
      ).toBeTruthy()
    );
  });
});

//INTEGRATION TESTS
describe("AIreport - Integration Tests", () => {
  it("shows AI report when Generate Report is clicked", async () => {
    const { getByText, queryByText } = render(<AIreport />);

    expect(queryByText(/Your AI Meal Report/i)).toBeNull();

    fireEvent.press(getByText("Generate Report"));

    await waitFor(() => expect(getByText(/Your AI Meal Report/i)).toBeTruthy());
  });
});
