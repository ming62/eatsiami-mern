import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ForgotPassword from "../app/(auth)/forgotPassword";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "expo-router";

//MOCKS
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../store/authStore", () => ({
  useAuthStore: jest.fn(),
}));
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return new Proxy({}, { get: () => View });
});
jest.mock("expo-image", () => ({ Image: () => null }));
global.fetch = jest.fn();

//SHARED MOCK SETUP
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

beforeEach(() => {
  require("expo-router").useRouter.mockReturnValue({
    push: mockRouterPush,
    back: mockRouterBack,
  });

  require("../store/authStore").useAuthStore.mockReturnValue({
    user: null,
  });

  jest.clearAllMocks();
});

//UNIT TESTS

describe("ForgotPassword screen (Unit Tests)", () => {
  it("renders step 1 by default", () => {
    const { getByText } = render(<ForgotPassword />);
    expect(getByText("Enter Email")).toBeTruthy();
  });

  it("disables email input if user is logged in", () => {
    require("../store/authStore").useAuthStore.mockReturnValue({
      user: { email: "test@example.com" },
    });

    const { getByDisplayValue } = render(<ForgotPassword />);
    const input = getByDisplayValue("test@example.com");
    expect(input.props.editable).toBe(false);
  });

  it("shows error if email is empty when sending code", async () => {
    const { getByText } = render(<ForgotPassword />);

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });

    await waitFor(() => {
      expect(
        getByText(
          "A reset code will be sent to your registered email address and will expire in 10 minutes."
        )
      ).toBeTruthy();
    });
  });

  it("validates email format before sending code", async () => {
    const { getByText, getByLabelText } = render(<ForgotPassword />);
    const input = getByLabelText("email address");

    await act(async () => {
      fireEvent.changeText(input, "invalid-email");
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });
  });

  it("resets step and code on back press from step 2", async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <ForgotPassword />
    );
    const emailInput = getByLabelText("email address");

    await act(async () => {
      fireEvent.changeText(emailInput, "test@example.com");
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });
    await waitFor(() => expect(queryByText("Enter Code")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByLabelText("arrow-back"));
    });
    await waitFor(() => expect(queryByText("Enter Email")).toBeTruthy());
  });
});

//INTEGRATION TESTS

describe("ForgotPassword screen (Integration Tests)", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("successfully sends code and switches to step 2", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { getByText, getByLabelText, queryByText } = render(
      <ForgotPassword />
    );

    await act(async () => {
      fireEvent.changeText(getByLabelText("email address"), "test@example.com");
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });

    await waitFor(() => {
      expect(queryByText("Enter Code")).toBeTruthy();
    });
  });

  it("fails to verify code if incorrect", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { getByText, getByLabelText } = render(<ForgotPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("email address"), "test@example.com");
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });

    await waitFor(() => getByLabelText("reset code"));

    await act(async () => {
      fireEvent.changeText(getByLabelText("reset code"), "123456");
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid code" }),
    });

    await act(async () => {
      fireEvent.press(getByText("Verify Code"));
    });

    await waitFor(() => {});
  });

  it("navigates to reset password on valid code", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      }) // send code
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      }); // verify code

    const { getByText, getByLabelText } = render(<ForgotPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("email address"), "test@example.com");
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });

    await waitFor(() => getByLabelText("reset code"));

    await act(async () => {
      fireEvent.changeText(getByLabelText("reset code"), "123456");
    });

    await act(async () => {
      fireEvent.press(getByText("Verify Code"));
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: "/(auth)/resetPassword",
        params: {
          email: "test@example.com",
          resetCode: "123456",
        },
      });
    });
  });

  it("resends code after countdown expires", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { getByText, getByLabelText } = render(<ForgotPassword />);

    await act(async () => {
      fireEvent.changeText(getByLabelText("email address"), "test@example.com");
    });

    await act(async () => {
      fireEvent.press(getByText("Send Reset Code"));
    });

    await waitFor(() => getByText(/Resend in/i)); // Verify timer starts

    //Fast-forward time to 60 seconds
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    await waitFor(() => getByLabelText("Resend Code"));

    await act(async () => {
      fireEvent.press(getByLabelText("Resend Code"));
    });
  });
});
