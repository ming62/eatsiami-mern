import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

  const styles = {
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    header: {
      alignItems: "center",
      backgroundColor: COLORS.primary,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      height: 70,
      justifyContent: "flex-end",
      paddingTop: 10,
      position: "relative",
    },
    headerTitle: {
      fontSize: 30,
      color: COLORS.white,
      fontFamily: "Konkhmer_Sleokchher-Regular",
      textAlign: "center",
      fontWeight: "600",
    },
    backButton: {
      position: "absolute",
      left: 20,
      top: "50%",
      marginTop: -12,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    content: {
      flex: 1,
      backgroundColor: COLORS.white,
      marginTop: -15,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 30,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
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
      borderRadius: 12,
      marginBottom: 10,
    },
    optionLeft: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.textPrimary,
      marginBottom: 5,
    },
    optionDescription: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    selectedOption: {
      backgroundColor: COLORS.primary + "20",
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    contentContainer: {
      margin: 25,
    },
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
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Who can see your foodcards?</Text>

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
              <Text style={styles.optionTitle}>
                <Ionicons name="globe-outline" size={18} /> Public
              </Text>
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
              <Text style={styles.optionTitle}>
                <Ionicons name="people-outline" size={18} /> Friends Only
              </Text>
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
