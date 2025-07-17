import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SignUpContainer() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading, register } = useAuthStore();

  SplashScreen.preventAutoHideAsync();

  const [fontsLoaded] = useFonts({
    "Konkhmer_Sleokchher-Regular": require("../../assets/fonts/KonkhmerSleokchher-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      Alert.alert("Success", "Registration successful!");
      router.push("/otherpage/profilePreview");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.black }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Gradient background */}
          <LinearGradient
            colors={["#ff5f00", "#ff8c00", "#ffb300"]}
            start={{ x: 0, y: 0.25 }}
            end={{ x: 0.8, y: 0 }}
            style={styles.gradientBackground}
          />

          {/* Sign up card */}
          <View style={styles.signUpCard}>
            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.titleText}>Get Started</Text>
                <Text style={styles.subtitleText}>enter you details below</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formContainer}>
                {/* Email field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>email address</Text>
                  <TextInput
                    style={styles.textInput}
                    accessibilityLabel="email address"
                    placeholder=""
                    placeholderTextColor={COLORS.searchBarLabel}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Username field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>username</Text>
                  <TextInput
                    style={styles.textInput}
                    accessibilityLabel="username"
                    placeholder=""
                    placeholderTextColor={COLORS.searchBarLabel}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                {/* Password field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>password</Text>
                  <TextInput
                    style={styles.textInput}
                    accessibilityLabel="password"
                    placeholder=""
                    placeholderTextColor={COLORS.searchBarLabel}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={23}
                      color={COLORS.searchBarLabel}
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>confirm password</Text>
                  <TextInput
                    style={styles.textInput}
                    accessibilityLabel="confirm password"
                    placeholder=""
                    placeholderTextColor={COLORS.searchBarLabel}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={23}
                      color={COLORS.searchBarLabel}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                activeOpacity={0.9}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#ff5f00", "#ff8c00", "#ffb300"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpButtonGradient}
                >
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <Link href="(auth)" asChild>
                <TouchableOpacity style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>already have an account!</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    width: screenWidth,
    height: screenHeight,
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
  },
  signUpCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 650,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: 27,
    paddingHorizontal: 53,
  },
  header: {
    marginBottom: 36,
    alignItems: "center",
  },
  titleText: {
    fontSize: 38,
    fontWeight: "400",
    color: COLORS.searchBarText,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.searchBarLabel,
    textAlign: "center",
    marginTop: -20,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  formContainer: {
    width: "100%",
    marginBottom: -15,
  },
  inputContainer: {
    width: "100%",
    height: 67,
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 18,
    marginBottom: 24,
    position: "relative",
    justifyContent: "center",
  },
  inputLabel: {
    position: "absolute",
    top: 4,
    left: 21,
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.searchBarLabel,
    textAlign: "left",
    zIndex: 1,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 16,
    color: COLORS.searchBarText,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
  },
  signUpButton: {
    width: "100%",
    height: 65,
    marginTop: 20,
    marginBottom: 6,
    borderRadius: 18,
  },
  signUpButtonGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  loginLinkContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.lightOrangeText,
    marginTop: -10,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: "40%",
    transform: [{ translateY: -10 }],
    padding: 5,
    zIndex: 2,
  },
});