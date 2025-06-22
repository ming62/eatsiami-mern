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
import { Colors } from "react-native/Libraries/NewAppScreen";

const CARD_WIDTH = 303;
const CARD_HEIGHT = 517;
const CARD_ASPECT_RATIO = 9 / 16;

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
        name={i <= rating ? "star" : "star-outline"} 
        size={26} 
        color={i <= rating ? "#FFD700" : "rgba(255, 255, 255, 0.3)"} 
        style={{ 
          marginRight: 3,
          textShadowColor: "rgba(0, 0, 0, 0.3)", 
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      />
    );
  }
  return <View style={{ flexDirection: "row", alignItems: "center" }}>{stars}</View>;
};

  useEffect(() => {
    if (cardId) {
      fetchCardDetails();
    }
  }, [cardId]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
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

  const isAuthor = user && foodcard?.user?._id && user.id === foodcard.user._id;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {/* Header - Matching Friends page */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {foodcard.user.username}'s {foodcard.title}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Image */}
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: foodcard.image }} style={styles.cardImage} />
          </View>
        </View>

        {/*Card Details */}
        <View style={styles.detailsCard}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{foodcard.title}</Text>

            <View style={styles.ratingLocationRow}>
              <View style={styles.ratingContainer}>
                {renderRatingStars(foodcard.rating)}
                <Text style={styles.ratingText}>({foodcard.rating}/5)</Text>
              </View>

              <View style={styles.locationSection}>
                <Text style={styles.locationText}>@ {foodcard.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.captionSection}>
            <Text style={styles.captionText}>{foodcard.caption}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.floatingActionButton,
              isAuthor
                ? styles.deleteFloatingButton
                : styles.saveFloatingButton,
            ]}
            onPress={isAuthor ? handleDelete : handleSave}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#2c2c2c" />
            ) : (
              <Ionicons
                name={
                  isAuthor ? "trash-outline" : saved ? "heart" : "heart-outline"
                }
                size={24}
                color={
                    isAuthor ? COLORS.black : "#2c2c2c"
                }
              />
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
    flexDirection: "column",
  },

  header: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher_Regular",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 15,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    elevation: CARD_WIDTH * 0.066,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_WIDTH * 0.053,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: CARD_WIDTH * 0.053,
    contentFit: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 15,
    borderRadius: CARD_WIDTH * 0.053,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: CARD_WIDTH * 0.198,
    height: CARD_WIDTH * 0.198,
    borderRadius: CARD_WIDTH * 0.099,
    marginRight: 10,
    backgroundColor: "#d3d3d3",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  username: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

  detailsCard: {
    backgroundColor: "#2c2c2c",
    marginHorizontal: 30,
    marginBottom: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 10,
    position: "relative",
    minHeight: 120,
  },
  headerActionButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSection: {
    marginBottom: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  ratingLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
    backgroundColor: COLORS.white,
    borderRadius: CARD_WIDTH * 0.04,
    paddingHorizontal: CARD_WIDTH * 0.026,
    paddingVertical: CARD_HEIGHT * 0.008,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  locationText: {
    fontSize: 16,
    color: "#2c2c2c",
    fontWeight: "600",
    marginBottom: CARD_HEIGHT * 0.004,
  },
  captionSection: {
    marginBottom: 15,
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
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  dateSection: {
    paddingTop: 5,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
  },
  floatingActionButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  saveFloatingButton: {
    backgroundColor: COLORS.white,
  },

  deleteFloatingButton: {
    backgroundColor: COLORS.white,
  },

  captionSection: {
    marginBottom: 15,
    paddingBottom: 60,
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
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
