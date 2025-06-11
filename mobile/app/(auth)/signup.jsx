import {
  View,
  Text,
  Image,
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
//import styles from "../../assets/styles/login.styles";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Link } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SignUpContainer() {
  // Form input placeholders

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, isLoading, register } = useAuthStore();

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [fontsLoaded] = useFonts({
    "Konkhmer_Sleokchher-Regular": require("../../assets/fonts/KonkhmerSleokchher-Regular.ttf"),
  });

  const router = useRouter();

  const handleSignUp = async () => {
    const result = await register(username, email, password);

    if (!result.success) Alert.alert("Error", result.error);
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
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
                placeholder=""
                placeholderTextColor="#8e8e8e"
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
                placeholder=""
                placeholderTextColor="#8e8e8e"
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
                placeholder=""
                placeholderTextColor="#8e8e8e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: screenWidth,
    height: screenHeight,
  },

  gradientBackground: {
    flex: 1,
    width: "100%",
  },

  signUpCard: {
    position: "absolute",
    bottom: 0, // Change from top: 216 to bottom: 0
    left: 0, // Add this
    right: 0, // Add this
    height: 600,
    backgroundColor: "#ffffff",
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
    color: "#2c2c2c",
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#8e8e8e",
    textAlign: "center",
    marginTop: -20,
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
  },
  formContainer: {
    width: "100%",
    marginBottom: -15,
  },
  inputContainer: {
    width: "100%",
    height: 67,
    backgroundColor: "#d9d9d9",
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
    color: "#8e8e8e",
    textAlign: "left",
    zIndex: 1,
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 16,
    color: "#2c2c2c",
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
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
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
  },
  loginLinkContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#f27609",
    marginTop: -10,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular", // Uncomment when font is loaded
  },
});
