import React, { useState, useEffect } from "react";
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
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function ForgotPassword() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Error", "No email found in your profile");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/email/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `Reset code sent to ${email}`);
        setStep(2);
        setCountdown(60);
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/email/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode: code }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push({
          pathname: "/(auth)/resetPassword",
          params: { email, resetCode: code },
        });
      } else {
        Alert.alert("Error", data.message || "Invalid code");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown > 0) return;

    Alert.alert(
      "Resend Code",
      "Are you sure you want to resend the verification code?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resend",
          onPress: () => {
            setCode("");
            handleSendCode();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(1);
      setCode("");
      setCountdown(0);
    }
  };

  const renderEmailStep = () => (
    <>
      <Text style={styles.subtitle}>
        We'll send a reset code to your registered email address
      </Text>

      <View style={styles.emailContainer}>
        <Text style={styles.emailLabel}>Email Address</Text>

        {isLoggedIn ? (
          <View style={styles.emailBox}>
            <Text style={styles.emailText}>{email || "Loading..."}</Text>
            <Ionicons name="mail-outline" size={20} color="#666" />
          </View>
        ) : (
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={true}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          (!email || isLoading) && styles.disabledButton,
        ]}
        onPress={handleSendCode}
        disabled={isLoading || !email}
      >
        <LinearGradient
          colors={
            !email || isLoading
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
            <Text style={styles.buttonText}>Send Reset Code</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ℹ️ The reset code will be sent to your registered email address and
          will expire in 10 minutes.
        </Text>
      </View>
    </>
  );

  const renderCodeStep = () => (
    <>
      <Text style={styles.subtitle}>
        Enter the 6-digit code we sent to{"\n"}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Reset Code</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#ccc"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          (!code || isLoading) && styles.disabledButton,
        ]}
        onPress={handleVerifyCode}
        disabled={isLoading || !code}
      >
        <LinearGradient
          colors={
            !code || isLoading
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
            <Text style={styles.buttonText}>Verify Code</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Resend Code Section */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={countdown > 0}
          style={styles.resendButton}
        >
          <Text
            style={[
              styles.resendButtonText,
              countdown > 0 && styles.disabledText,
            ]}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ⏰ This code will expire in 10 minutes. If you don't receive it, check
          your spam folder.
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 1 ? "Reset Password" : "Verify Code"}
        </Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: step === 1 ? "50%" : "100%" },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step {step} of 2</Text>
      </View>

      <View style={styles.content}>
        {step === 1 ? renderEmailStep() : renderCodeStep()}
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff5f00",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
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
  emailHighlight: {
    fontWeight: "600",
    color: "#ff5f00",
  },
  emailContainer: {
    marginBottom: 30,
  },
  emailLabel: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  emailBox: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emailText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  emailInput: {
    height: 67,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  codeInput: {
    height: 67,
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    paddingHorizontal: 21,
    fontSize: 24,
    color: "#2c2c2c",
    textAlign: "center",
    letterSpacing: 8,
    fontWeight: "bold",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  actionButton: {
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
  resendContainer: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#ff5f00",
    fontWeight: "600",
  },
  disabledText: {
    color: "#ccc",
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff5f00",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
