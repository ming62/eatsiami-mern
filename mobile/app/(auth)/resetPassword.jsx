import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { email, resetCode } = useLocalSearchParams();
  const { logout } = useAuthStore();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/email/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          "Password reset successful! Please login with your new password.",
          [
            {
              text: "OK",
              onPress: () => {
                logout();
                router.replace("/(auth)");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="arrow-back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.rightSpace} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>Enter your new password</Text>

          <View style={styles.formContainer}>
            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>new password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput]}
                  placeholder=""
                  placeholderTextColor={COLORS.searchBarLabel}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  accessibilityLabel="new-password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  accessibilityLabel="toggle-password-visibility"
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={23}
                    color={COLORS.searchBarLabel}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>confirm password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  accessibilityLabel="confirm-password-input"
                  style={[styles.textInput]}
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
                  accessibilityLabel="toggle-confirm-password-visibility"
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={23}
                    color={COLORS.searchBarLabel}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              (!newPassword || !confirmPassword || isLoading) &&
                styles.disabledButton,
            ]}
            onPress={handleResetPassword}
            activeOpacity={0.8}
            accessibilityLabel="reset-password-button"
            accessibilityState={{
              disabled: isLoading || !newPassword || !confirmPassword,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                  style={{ marginRight: 10 }}
                />
              )}
              <Text style={styles.buttonText}>Reset Password</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    paddingTop: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "400",
  },
  rightSpace: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  formContainer: {
    paddingHorizontal: 0,
    marginTop: 0,
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
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 22,
    padding: 5,
  },
  actionButton: {
    height: 56,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 60,
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.searchBarBackground,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
    alignContent: "center",
    textAlign: "center",
  },
});
