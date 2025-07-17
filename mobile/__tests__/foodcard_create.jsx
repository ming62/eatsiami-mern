import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import Create from "../app/(tabs)/create";
import Preview from "../app/otherpage/preview";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    }),
    useLocalSearchParams: () => ({
      title: "Test Food",
      tag: "lunch",
      location: "Canteen",
      caption: "Yummy food!",
      image: "mock-image-uri",
      imageBase64: "mock-base64",
      rating: "4",
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

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});


jest.mock("../store/authStore", () => ({
  useAuthStore: () => ({
    token: "mock-token",
  }),
}));

jest.mock("../constants/api", () => ({
  API_URL: "http://mock-api",
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  __esModule: true,
  default: {
    alert: jest.fn(),
  },
}));

jest.mock("expo-camera", () => {
  const mockReact = require("react");
  return {
    CameraView: mockReact.forwardRef((props, ref) => {
      mockReact.useImperativeHandle(ref, () => ({
        takePictureAsync: async () => ({
          uri: "mock-image-uri",
          base64: "mock-base64",
          width: 1080,
          height: 1920,
        }),
      }));
      mockReact.useEffect(() => {
        if (props.onCameraReady) {
          setTimeout(() => props.onCameraReady(), 50);
        }
      }, [props.onCameraReady]);
      return null;
    }),
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
  };
});

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      uri: "gallery-image-uri",
      width: 1080,
      height: 1920,
      assets: [{ uri: "gallery-image-uri", width: 1080, height: 1920 }],
    })
  ),
}));

jest.mock("expo-image-manipulator", () => {
  function Chainable() {}
  Chainable.prototype.crop = function () { return this; };
  Chainable.prototype.resize = function () { return this; };
  Chainable.prototype.renderAsync = async function () {
    return {
      saveAsync: async () => ({
        uri: "mock-processed-image-uri",
        base64: "mock-processed-base64",
      }),
    };
  };
  return {
    __esModule: true,
    ImageManipulator: {
      manipulate: jest.fn(() => new Chainable()),
    },
    SaveFormat: { JPEG: "jpeg" },
  };
});


jest.mock("@react-navigation/native", () => {
  // Add this line to import React into the mock's scope
  const mockReact = require("react");

  return {
    ...jest.requireActual("@react-navigation/native"),
    // A mock implementation for useFocusEffect that uses React.useEffect
    useFocusEffect: jest.fn((callback) => {
      // Now 'React' is defined and this line will work correctly
      mockReact.useEffect(callback, []);
    }),
  };
});
// Now import everything else


describe("<Create /> Food Card Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  it("simulates picking from gallery, fills in fields, navigates to preview, and submits to tabs page", async () => {
    const { getByText, getByLabelText } = render(
      <NavigationContainer>
        <Create />
      </NavigationContainer>
    );

    // Wait for camera to be ready
    await waitFor(() => {
      expect(getByLabelText("pick from gallery")).toBeTruthy();
    });

    // Simulate picking from gallery
    await act(async () => {
      fireEvent.press(getByLabelText("pick from gallery"));
    });

    // Wait for the form to appear
    await waitFor(() => {
      expect(getByLabelText("title-test")).toBeTruthy();
    }, { timeout: 3000 });

    // Fill in the form fields
    fireEvent.changeText(getByLabelText("title-test"), "Gallery Food");
    fireEvent.changeText(getByLabelText("location"), "Kitchen");
    fireEvent.changeText(getByLabelText("caption"), "From gallery!");
    fireEvent.press(getByText("dinner"));

    // Press preview button
    fireEvent.press(getByText("Preview Food Card"));

    // Should navigate to preview page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "otherpage/preview",
        params: expect.objectContaining({
          title: "Gallery Food",
          tag: "dinner",
          location: "Kitchen",
          caption: "From gallery!",
          image: "mock-processed-image-uri",
          imageBase64: "mock-processed-base64",
          rating: "3",
        }),
      });
    });

    // Now simulate the preview page workflow
    const { getByText: getByTextPreview } = render(
      <NavigationContainer>
        <Preview />
      </NavigationContainer>
    );
    
    // Wait for preview to load and then press submit
    await waitFor(() => {
      expect(getByTextPreview("Submit")).toBeTruthy();
    });
    
    // Simulate pressing the submit button in preview
    await act(async () => {
      fireEvent.press(getByTextPreview("Submit"));
    });
    
    // Wait for navigation to tabs page
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});