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
import { LinearGradient } from "expo-linear-gradient";

export default function Preview() {
  const router = useRouter();
  const { token } = useAuthStore();

  const { title, tag, location, caption, image, imageBase64, rating } =
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
      console.log(imageDataUrl);
      const response = await fetch(`${API_URL}/foodcards/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          tag,
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
      <View style={styles.cardContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageBase64
                ? `data:image/jpeg;base64,${imageBase64}`
                : image,
            }}
            style={styles.cardImage}
          />

          <LinearGradient
            colors={[
              "transparent",
              "transparent",
              "transparent",
              "rgba(0,0,0,0.2)",
              "rgba(0,0,0,0.6)",
              "rgba(0,0,0,0.8)",
            ]}
            locations={[0, 0.5, 0.7, 0.8, 0.9, 1]}
            style={styles.gradientOverlay}
          >
            <View style={styles.userInfo}></View>

            <View style={styles.foodcardDetails}>
              <View style={styles.ratingContainer}>
                <Text style={styles.foodcardTitle}>{title}</Text>
                {renderRatingStars(rating)}
              </View>
              <Text style={styles.caption}>{caption}</Text>
              <View style={styles.tagContainer}>
                <View style={styles.locationContainer}>
                  <Text style={styles.location}>{location}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <Text style={styles.location}>{tag}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
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
          item: { title, tag, location, caption, rating, image, imageBase64 },
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
