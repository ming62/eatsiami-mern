import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { use, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import COLORS from "../constants/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const { checkAuth, user, token } = useAuthStore();
  SplashScreen.preventAutoHideAsync();

  const [fontsLoaded] = useFonts({
    "Konkhmer_Sleokchher-Regular": require("../assets/fonts/KonkhmerSleokchher-Regular.ttf"),
    "YoungSerif-Regular": require("../assets/fonts/YoungSerif-Regular.ttf"),
    Bagnard: require("../assets/fonts/Bagnard.otf"),
    Transicty: require("../assets/fonts/Transcity DEMO.otf"),
    Manbow: require("../assets/fonts/Manbow Lines.otf"),
    Milkyway: require("../assets/fonts/Milkyway DEMO.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    initAuth();
  }, []);

  // handle navigation based on auth state
  useEffect(() => {
    if (!isReady) return;
    const inAuthScreen =
      segments[0] === "(auth)" &&
      (segments[1] === undefined || segments[1] === "signup");
    const inResetScreen =
      segments[0] === "(auth)" && ( segments[1] === "resetPassword" || segments[1] === "forgotPassword");
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen && !inResetScreen) {
      router.replace("/(auth)");
    }
    if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </SafeScreen>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
