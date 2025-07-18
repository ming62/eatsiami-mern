import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import UpdateProfile from "../app/otherpage/more/updateUser";
// Mocks
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [
        {
          uri: "mock-uri",
          base64: "mock-base64",
        },
      ],
    })
  ),
}));

jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve("mock-base64")),
  EncodingType: {
    Base64: "base64",
  },
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    user: {
      id: "123",
      username: "originaluser",
      bio: "original bio",
      profileImage: "https://res.cloudinary.com/existing.jpg",
    },
    token: "mock-token",
    setUser: jest.fn(),
  }),
}));

jest.mock("../constants/colors", () => ({
  primary: "#000",
  white: "#fff",
  background: "#fff",
  textSecondary: "#888",
  black: "#000",
  searchBarBackground: "#eee",
  searchBarLabel: "#333",
  searchBarText: "#111",
  placeholderText: "#aaa",
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        user: {
          id: "123",
          username: "updateduser",
          bio: "updated bio",
          profileImage: "updated-image",
        },
      }),
  })
);

describe("UpdateProfile", () => {
  it("renders fields and updates profile", async () => {
    const { getByText, getByDisplayValue, getByRole } = render(
      <UpdateProfile />
    );

    // Check form fields are populated with initial values
    expect(getByDisplayValue("originaluser")).toBeTruthy();
    expect(getByDisplayValue("original bio")).toBeTruthy();

    // Update username and bio
    fireEvent.changeText(getByDisplayValue("originaluser"), "updateduser");
    fireEvent.changeText(getByDisplayValue("original bio"), "updated bio");

    // Press update button
    fireEvent.press(getByText("Update"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/users/update/123",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
          body: expect.stringContaining("updateduser"),
        })
      );
    });
  });
});
