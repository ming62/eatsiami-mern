import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import UpdateProfile from "../app/otherpage/more/updateUser";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";

//MOCKS
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
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

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

global.fetch = jest.fn();

//SHARED MOCK SETUP
const mockRouterBack = jest.fn();
const mockSetUser = jest.fn();

beforeEach(() => {
  require("expo-router").useRouter.mockReturnValue({
    back: mockRouterBack,
  });

  require("../store/authStore").useAuthStore.mockReturnValue({
    user: {
      id: "123",
      username: "originaluser",
      bio: "original bio",
      profileImage: "https://res.cloudinary.com/existing.jpg",
    },
    token: "mock-token",
    setUser: mockSetUser,
  });

  jest.clearAllMocks();
});

//UNIT TESTS

describe("UpdateProfile screen (Unit Tests)", () => {
  it("renders form fields with initial values", () => {
    const { getByDisplayValue, getByText, getByLabelText } = render(
      <UpdateProfile />
    );

    expect(getByDisplayValue("originaluser")).toBeTruthy();
    expect(getByDisplayValue("original bio")).toBeTruthy();
    expect(getByText("Edit Profile")).toBeTruthy();
    expect(getByLabelText("arrow-back")).toBeTruthy();
  });

  it("updates username and bio fields", async () => {
    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "newusername");
      fireEvent.changeText(getByLabelText("bio-input"), "new bio");
    });

    expect(getByLabelText("username-input").props.value).toBe("newusername");
    expect(getByLabelText("bio-input").props.value).toBe("new bio");
  });

  it("shows alert if fields are empty", async () => {
    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "");
      fireEvent.changeText(getByLabelText("bio-input"), "");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("update-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Please fill in all fields.");
    });
  });
});

//INTEGRATION TESTS

describe("UpdateProfile screen (Integration Tests)", () => {
  it("successfully updates profile", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: "123",
          username: "updateduser",
          bio: "updated bio",
          profileImage: "https://res.cloudinary.com/existing.jpg",
        },
      }),
    });

    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "updateduser");
      fireEvent.changeText(getByLabelText("bio-input"), "updated bio");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("update-button"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://mock-api/users/update/123",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
          body: expect.stringContaining("updateduser"),
        })
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile updated!");
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it("handles API error when updating profile", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Failed to update profile",
      }),
    });

    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "updateduser");
      fireEvent.changeText(getByLabelText("bio-input"), "updated bio");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("update-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to update profile"
      );
    });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockRouterBack).not.toHaveBeenCalled();
  });

  it("handles network error when updating profile", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "updateduser");
      fireEvent.changeText(getByLabelText("bio-input"), "updated bio");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("update-button"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Network error");
    });

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockRouterBack).not.toHaveBeenCalled();
  });

  it("shows and hides loading state during update", async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetch.mockReturnValueOnce(promise);

    const { getByLabelText } = render(<UpdateProfile />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("username-input"), "updateduser");
      fireEvent.changeText(getByLabelText("bio-input"), "updated bio");
    });

    await act(async () => {
      fireEvent.press(getByLabelText("update-button"));
    });

    // Should show loading state (button disabled)
    const button = getByLabelText("update-button");
    expect(button.props.accessibilityState?.disabled).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({
          user: {
            id: "123",
            username: "updateduser",
            bio: "updated bio",
            profileImage: "https://res.cloudinary.com/existing.jpg",
          },
        }),
      });
    });

    // Loading should be hidden
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile updated!");
    });
  });
});
