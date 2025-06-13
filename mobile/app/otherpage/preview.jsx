import {
  View,
  Platform,
  Image,
  Alert,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import styles from "../../assets/styles/preview.styles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Preview() {
  const router = useRouter();
  const { token } = useAuthStore();

  const { title, location, caption, image, imageBase64, rating } =
    useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const currentDate = new Date();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${API_URL}/foodcards/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          location,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      Alert.alert("Success", "Food card created successfully!");
      router.replace("/");
    } catch (error) {
      console.error("Error creating food card:", error);
      Alert.alert("Error", "Could not create food card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color={i <= rating ? "#F4B400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.bookCard}>
        <View style={styles.bookImageContainer}>
          <Image
            source={{
              uri: imageBase64
                ? `data:image/jpeg;base64,${imageBase64}`
                : image,
            }}
            style={styles.previewImage}
          />

          <View style={styles.overlayContent}>
            <View style={styles.infoBackground} />
            <View style={styles.bookDetails}>
              <View style={styles.ratingContainer}>
                <Text style={styles.bookTitle}>{title}</Text>
                {renderRatingStars(rating)}
              </View>
              <Text style={styles.caption}>{caption}</Text>
              <Text style={styles.date}>
                Shared on{" "}
                {currentDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Preview</Text>
        <View style={styles.backButton} />
      </View>

      {/* Preview content */}
      <View style={styles.contentFrame}>
        {renderItem({
          item: { title, location, caption, rating, image, imageBase64 },
        })}
      </View>

      {/* submit button */}
      <View style={styles.footerFrame}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
