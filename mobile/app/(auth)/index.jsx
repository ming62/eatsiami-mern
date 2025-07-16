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
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LoginContainer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login, isCheckingAuth } = useAuthStore();

  const handleLogin = async () => {
    const reuslt = await login(email, password);

    if (!reuslt.success) {
      Alert.alert("Error", reuslt.error);
    } else {
      router.push("/(tabs)");
    }
  };

  if (isCheckingAuth) {
    return null;
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
            colors={[COLORS.primary, "#ff8c00", "#ffb300"]}
            start={{ x: 0, y: 0.25 }}
            end={{ x: 0.8, y: 0 }}
            style={styles.gradientBackground}
          />

          {/* Login card */}
          <View style={styles.loginCard}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>enter you details below</Text>
            </View>

            {/* Form fields */}
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

              {/* Password field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
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
                <Link href="/forgotPassword" asChild>
                  <TouchableOpacity style={styles.forgotPassContainer}>
                    <Text style={styles.forgotPassText}>
                      forgot your password
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Login button */}
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.9}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[COLORS.primary, "#ff8c00", "#ffb300"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Create account link */}
            <Link href="/signup" asChild>
              <TouchableOpacity style={styles.createAccountContainer}>
                <Text style={styles.createAccountText}>
                  create an account here!
                </Text>
              </TouchableOpacity>
            </Link>
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
  loginCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 503,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginTop: 35,
  },
  welcomeText: {
    fontSize: 34,
    color: COLORS.searchBarText,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  subtitleText: {
    fontSize: 15,
    color: COLORS.searchBarLabel,
    fontWeight: "400",
    marginTop: -20,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  formContainer: {
    paddingHorizontal: 53,
    marginTop: 32,
  },
  inputContainer: {
    marginBottom: 24,
    position: "relative",
  },
  inputLabel: {
    position: "absolute",
    top: 4,
    left: 21,
    fontSize: 15,
    color: COLORS.searchBarLabel,
    fontWeight: "400",
    zIndex: 1,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  textInput: {
    height: 67,
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 18,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 16,
    color: COLORS.searchBarText,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
  },
  loginButton: {
    width: "100%",
    height: 67,
    borderRadius: 18,
  },
  loginButtonGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  createAccountContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  createAccountText: {
    fontSize: 15,
    color: COLORS.lightOrangeText,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  forgotPassContainer: {
    alignItems: "flex-start",
    paddingLeft: 20,
    marginTop: 5,
  },
  forgotPassText: {
    fontSize: 13,
    color: COLORS.searchBarLabel,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40,
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
