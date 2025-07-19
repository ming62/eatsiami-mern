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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="arrow-back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.rightSpace} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepIndicator}>
          <View
            style={[styles.stepCircle, step === 1 && styles.stepCircleActive]}
          >
            <Text
              style={[styles.stepNumber, step === 1 && styles.stepNumberActive]}
            >
              1
            </Text>
          </View>
          <View style={styles.stepLine} />
          <View
            style={[styles.stepCircle, step === 2 && styles.stepCircleActive]}
          >
            <Text
              style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}
            >
              2
            </Text>
          </View>
        </View>
        <Text style={styles.stepLabel}>
          {step === 1 ? "Enter Email" : "Enter Code"}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {step === 1 ? (
            <>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>email address</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      accessibilityLabel="email address"
                      style={[
                        styles.textInput,
                        isLoggedIn && styles.inputDisabled,
                      ]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus={true}
                      editable={!isLoggedIn}
                    />
                    {isLoggedIn && (
                      <Ionicons
                        name="lock-closed"
                        size={22}
                        color={COLORS.searchBarLabel}
                        style={styles.inputIcon}
                      />
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!email || isLoading) && styles.disabledButton,
                ]}
                onPress={handleSendCode}
                accessibilityLabel="Send Reset Code"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.infoText}>
                A reset code will be sent to your registered email address and
                will expire in 10 minutes.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter the 6-digit code we sent to{" "}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>reset code</Text>
                  <TextInput
                    accessibilityLabel="reset code"
                    style={styles.codeInput}
                    placeholder="000000"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!code || code.length !== 6 || isLoading) &&
                    styles.disabledButton,
                ]}
                onPress={handleVerifyCode}
                accessibilityLabel="Verify Code"
                disabled={isLoading || !code}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity
                  accessibilityLabel="Resend Code"
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
            </>
          )}
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
  stepIndicatorContainer: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 18,
    color: "#aaa",
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#eee",
    marginHorizontal: 2,
  },
  stepLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginTop: 4,
    marginBottom: 2,
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
  inputDisabled: {
    color: COLORS.searchBarLabel,
    opacity: 0.7,
  },
  inputIcon: {
    position: "absolute",
    right: 16,
    top: 22,
  },
  codeInput: {
    height: 100,
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 18,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 24,
    color: COLORS.searchBarText,
    textAlign: "center",
    letterSpacing: 8,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 0,
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
  buttonGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
    alignContent: "center",
    textAlign: "center",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  disabledText: {
    color: "#ccc",
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 18,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});
