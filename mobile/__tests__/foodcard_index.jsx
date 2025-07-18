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

let mockShouldTriggerSwipe = false;
jest.mock("../components/SwipeableCard", () => {
  const { useEffect } = require("react");
  const { Text } = require("react-native");
  return (props) => {
    useEffect(() => {
      if (mockShouldTriggerSwipe && props.onSwipeRight) {
        props.onSwipeRight(props.item, props.index);
      }
    }, []);
    return <>{props.item?.title && <Text>{props.item.title}</Text>}</>;
  };
});

describe("Home Foodcard List", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShouldTriggerSwipe = false;
  });

  it("displays a foodcard from API", async () => {
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
                user: { profileImage: "mock-profile", privacy: "public" },
              },
            ],
            totalPages: 1,
          }),
      })
    );

    const { getByText } = render(<Home />);
    await waitFor(() => {
      expect(getByText("Test Foodcard")).toBeTruthy();
    });
  });

  it("does not display foodcards with privacy set to private", async () => {
    // Do NOT trigger swipe here!
    mockShouldTriggerSwipe = false;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            foodcards: [
              {
                _id: "2",
                title: "Private Foodcard",
                caption: "Secret!",
                location: "Hidden",
                tag: "dinner",
                rating: 5,
                image: "mock-image-uri",
                user: { profileImage: "mock-profile", privacy: "private" },
              },
            ],
            totalPages: 1,
          }),
      })
    );

    const { queryByText } = render(<Home />);
    await waitFor(() => {
      expect(queryByText("Private Foodcard")).toBeNull();
    });
  });

  it("calls saveFoodcard API when swiped right", async () => {
    mockShouldTriggerSwipe = true; 
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
                user: { profileImage: "mock-profile", privacy: "public" },
              },
            ],
            totalPages: 1,
          }),
      })
    );

    render(<Home />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/foodcards/save-foodcard/1"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
