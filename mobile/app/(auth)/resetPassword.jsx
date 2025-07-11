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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

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
                logout(); // Log out user so they can login with new password
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>New Password</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Enter your new password</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter new password"
              placeholderTextColor="#8e8e8e"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#8e8e8e"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm new password"
              placeholderTextColor="#8e8e8e"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#8e8e8e"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.resetButton,
            (!newPassword || !confirmPassword || isLoading) &&
              styles.disabledButton,
          ]}
          onPress={handleResetPassword}
          disabled={isLoading || !newPassword || !confirmPassword}
        >
          <LinearGradient
            colors={
              !newPassword || !confirmPassword || isLoading
                ? ["#ccc", "#999"]
                : ["#ff5f00", "#ff8c00", "#ffb300"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  passwordWrapper: {
    position: "relative",
  },
  textInput: {
    height: 67,
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    paddingHorizontal: 21,
    paddingRight: 50,
    fontSize: 16,
    color: "#2c2c2c",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 23,
    padding: 5,
  },
  resetButton: {
    height: 67,
    borderRadius: 18,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "400",
  },
});
