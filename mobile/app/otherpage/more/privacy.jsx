import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/authStore";
import { API_URL } from "../../../constants/api";
import COLORS from "../../../constants/colors";

export default function Privacy() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const [privacy, setPrivacy] = useState(user?.privacy || "public");
  const [loading, setLoading] = useState(false);

  const updatePrivacySettings = async (newPrivacy) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/privacy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ privacy: newPrivacy }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update privacy settings");
      }

      setPrivacy(newPrivacy);
      setUser(data.user);
      Alert.alert("Success", "Privacy settings updated successfully!");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to update privacy settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={styles.rightSpace} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.optionContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              privacy === "public" && styles.selectedOption,
            ]}
            onPress={() => updatePrivacySettings("public")}
            disabled={loading}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Public</Text>
              <Text style={styles.optionDescription}>
                Anyone can see your foodcards on the main feed and visit your
                profile
              </Text>
            </View>
            {privacy === "public" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              privacy === "private" && styles.selectedOption,
            ]}
            onPress={() => updatePrivacySettings("private")}
            disabled={loading}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionTitle}>Friends Only</Text>
              <Text style={styles.optionDescription}>
                Only your friends can see your foodcards and visit your profile
              </Text>
            </View>
            {privacy === "private" && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>
              Updating privacy settings...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: "#eee",
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
    fontWeight: "bold",
  },
  rightSpace: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#eee",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: COLORS.textPrimary,
    marginBottom: 20,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  optionContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,

    padding: 15,
    paddingTop: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionLeft: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: "400",
    color: COLORS.lightBlackText,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.lightBlackText,
    lineHeight: 20,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
    opacity: 0.5,
  },
  selectedOption: {
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
});
