import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import Home from "../app/(tabs)/index";

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
  Image: (props) => <></>,
}));

jest.mock("../constants/colors", () => ({
  primary: "#000",
  white: "#fff",
  background: "#fff",
  textSecondary: "#888",
  starColor: "#f4b400",
}));

jest.mock("../components/SwipeableCard", () => {
  const { Text } = require("react-native");
  return (props) => (
    <>{props.item?.title && <Text>{props.item.title}</Text>}</>
  );
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        foodcards: [
          {
            _id: "1",
            title: "Test Foodcard",
            caption: "Yummy!",
            location: "Canteen",
            tag: "lunch",
            rating: 4,
            image: "mock-image-uri",
            user: { profileImage: "mock-profile" },
          },
        ],
        totalPages: 1,
      }),
  })
);

describe("Home Foodcard List", () => {
  it("displays a foodcard from API", async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => {
      expect(getByText("Test Foodcard")).toBeTruthy();
    });
  });
});