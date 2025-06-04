import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { use, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useFonts } from "expo-font";



SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const {checkAuth, user, token} = useAuthStore();

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
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
    }
    initAuth();
  }, []);

  // handle navigation based on auth state
  useEffect(() => {

    if (!isReady) return; 
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    } 

  }, [user, token, segments, isReady]);

  if (!isReady) {
    return null; 
  }


  
  return (
    <SafeAreaProvider>
      <SafeScreen>

    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="(auth)"/>
    </Stack>

    </SafeScreen>
    <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
