import { render, waitFor, fireEvent } from "@testing-library/react-native";
import React from "react";
import Profile from "../app/(tabs)/profile";

jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
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
  starColor: "#f4b400",
}));

jest.mock("../components/ProfileHeader", () => () => null);
jest.mock("../components/Loader", () => () => null);

global.fetch = jest.fn((url) => {
  if (url.endsWith("/foodcards/user")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "mine1",
            title: "Mine Foodcard",
            image: "mine-image",
          },
        ]),
    });
  }
  if (url.endsWith("/foodcards/saved-foodcards")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            _id: "saved1",
            title: "Saved Foodcard",
            image: "saved-image",
          },
        ]),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  });
});

describe("Profile Foodcard List", () => {
  it("displays a foodcard under Mine", async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText("Mine Foodcard")).toBeTruthy();
    });
  });

  it("displays a foodcard under Saved after tab switch", async () => {
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText("Saved")).toBeTruthy();
    });
    // Use fireEvent to simulate tab press
    fireEvent.press(getByText("Saved"));
    await waitFor(() => {
      expect(getByText("Saved Foodcard")).toBeTruthy();
    });
  });
});