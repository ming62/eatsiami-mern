import { render, waitFor, fireEvent, act } from "@testing-library/react-native";
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
    fireEvent.press(getByText("Saved"));
    await waitFor(() => {
      expect(getByText("Saved Foodcard")).toBeTruthy();
    });
  });

  it("shows 'No foodcards found.' when Mine is empty", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.endsWith("/foodcards/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.endsWith("/foodcards/saved-foodcards")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { _id: "saved1", title: "Saved Foodcard", image: "saved-image" },
            ]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText("No foodcards found.")).toBeTruthy();
    });
  });

  it("shows 'No saved foodcards yet.' when Saved is empty", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.endsWith("/foodcards/user")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { _id: "mine1", title: "Mine Foodcard", image: "mine-image" },
            ]),
        });
      }
      if (url.endsWith("/foodcards/saved-foodcards")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText("Saved")).toBeTruthy();
    });
    fireEvent.press(getByText("Saved"));
    await waitFor(() => {
      expect(getByText("No saved foodcards yet.")).toBeTruthy();
    });
  });

  it("calls fetchData and fetchSavedFoodcards on pull to refresh", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");
    const { getByTestId } = render(<Profile />);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/foodcards/user"),
        expect.any(Object)
      );
    });
    const flatList = getByTestId("flatlist-foodcards");
    await act(async () => {
      fireEvent(flatList, "refresh");
    });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/foodcards/user"),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/foodcards/saved-foodcards"),
        expect.any(Object)
      );
    });
    fetchSpy.mockRestore();
  });
});