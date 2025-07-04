import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/authStore";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";
import Loader from "../../../components/Loader";
import Slider from "@react-native-community/slider";
import styles from "../../../assets/styles/AIreport.js";

export default function AIreport() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [days, setDays] = useState(7);
  const [statusMessage, setStatusMessage] = useState("");
  const userID = user.id;

  const handleGenerateReport = async () => {
    setStatusMessage("fetching user data...");
    if (!userID || !token) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    setLoading(true);
    setAiReport("");
    try {
      setStatusMessage("analyzing your eating habit...");
      const response = await fetch(`${API_URL}/ai/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userID, days }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate report");
      }

      const data = await response.json();
      setAiReport(data.aiReport || "No report returned.");
      setStatusMessage("report sucessfully created!");
    } catch (error) {
      console.error("Error generating report:", error);
      Alert.alert("Error", error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Report</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Select report range</Text>
        <Text style={styles.sliderValue}>
          Last {days} day{days > 1 ? "s" : ""}
        </Text>

        <Slider
          style={styles.slider}
          minimumValue={3}
          maximumValue={30}
          step={1}
          value={days}
          onValueChange={(value) => setDays(value)}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.grey}
          thumbTintColor={COLORS.primary}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerateReport}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Generate Report</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <Loader />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      {aiReport !== "" && (
        <ScrollView style={styles.reportBox}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>Report</Text>
            <Text style={styles.disclaimer}>
              This report is AI-generated and for reference only
            </Text>
          </View>
          <Text style={styles.reportText}>{aiReport}</Text>
          <Text style={styles.disclaimer}>
            This report is AI-generated and for reference only
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
