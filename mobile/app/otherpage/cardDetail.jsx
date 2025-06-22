import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";

export default function CardDetail() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams();
  const { token, user } = useAuthStore();

  const [foodcard, setFoodcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCardDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/foodcards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch card details");
      }

      setFoodcard(data);
      setSaved(data.isSaved || false);
    } catch (error) {
      console.error("Error fetching card details:", error);
      Alert.alert("Error", error.message || "Failed to fetch card details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Foodcard",
      "Are you sure you want to delete this foodcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await fetch(`${API_URL}/foodcards/${cardId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.message || "Failed to delete foodcard");
              }
              Alert.alert("Success", "Foodcard deleted successfully.");
              router.back();
            } catch (error) {
              console.error("Error deleting foodcard:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting the foodcard. Please try again."
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      const endpoint = saved
        ? `${API_URL}/foodcards/unsave-foodcard/${cardId}`
        : `${API_URL}/foodcards/save-foodcard/${cardId}`;

      const method = saved ? "DELETE" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save card");
      }

      setSaved(!saved);
    } catch (error) {
      console.error("Error saving card:", error);
      Alert.alert("Error", error.message || "Failed to save card");
    } finally {
      setActionLoading(false);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={24}
          color={i <= rating ? "#F4B400" : COLORS.textSecondary}
          style={{ marginRight: 4 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  useEffect(() => {
    if (cardId) {
      fetchCardDetails();
    }
  }, [cardId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading foodcard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!foodcard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Foodcard not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAuthor = user && foodcard.user._id === user._id;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foodcard</Text>
        <TouchableOpacity
          onPress={isAuthor ? handleDelete : handleSave}
          style={styles.headerButton}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons
              name={
                isAuthor ? "trash-outline" : saved ? "heart" : "heart-outline"
              }
              size={24}
              color={isAuthor ? "#FF3B30" : COLORS.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: foodcard.image }} style={styles.cardImage} />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "transparent",
              "transparent",
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.7)",
            ]}
            style={styles.gradientOverlay}
          >
            <View style={styles.userInfo}>
              <Image
                source={{ uri: foodcard.user.profileImage }}
                style={styles.avatar}
              />
              <Text style={styles.username}>@{foodcard.user.username}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Card Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{foodcard.title}</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStars(foodcard.rating)}
              <Text style={styles.ratingText}>({foodcard.rating}/5)</Text>
            </View>
          </View>

          <View style={styles.locationSection}>
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.locationText}>{foodcard.location}</Text>
          </View>

          <View style={styles.captionSection}>
            <Text style={styles.captionLabel}>About this dish:</Text>
            <Text style={styles.captionText}>{foodcard.caption}</Text>
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.dateText}>
              Shared on {formatPublishDate(foodcard.createdAt)}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isAuthor ? styles.deleteButton : styles.saveButton,
            ]}
            onPress={isAuthor ? handleDelete : handleSave}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name={
                    isAuthor
                      ? "trash-outline"
                      : saved
                        ? "heart"
                        : "heart-outline"
                  }
                  size={20}
                  color={COLORS.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.actionButtonText}>
                  {isAuthor ? "Delete Foodcard" : saved ? "Unsave" : "Save"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 400,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    contentFit: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#d3d3d3",
  },
  username: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  detailsContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFE4D6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  captionSection: {
    marginBottom: 20,
  },
  captionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  captionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  dateSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 15,
    marginBottom: 30,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
