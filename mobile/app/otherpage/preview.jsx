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
  Dimensions,
  StyleSheet,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_RATIO = 9 / 16;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;
const CARD_WIDTH = CARD_HEIGHT * CARD_RATIO;

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
  for (let i = 1; i <= rating; i++) {
    stars.push(
      <Ionicons
        key={i}
        name="star"
        size={CARD_WIDTH * 0.066}
        color={i <= rating ? COLORS.starColor : COLORS.textSecondary}
        style={{
          marginRight: CARD_WIDTH * 0.0066, marginBottom: CARD_HEIGHT * 0.005,
        }}
      />
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {stars}
    </View>
  );
};

  const PreviewFoodCard = ({
    title,
    tag,
    location,
    caption,
    image,
    imageBase64,
    rating,
  }) => (
    <View style={previewCardStyles.cardContainer}>
      <View style={previewCardStyles.imageContainer}>
        <Image
          source={{
            uri: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : image,
          }}
          style={previewCardStyles.cardImage}
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
          style={previewCardStyles.gradientOverlay}
        >
          <View style={previewCardStyles.detailsContainer}>
            {/* Title and Rating Row */}
            <View style={previewCardStyles.titleRatingRow}>
              <Text
                style={previewCardStyles.foodcardTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              <View style={previewCardStyles.ratingRight}>
                {renderRatingStars(rating)}
              </View>
            </View>

            {/* Caption, Location and User Profile Picture Row */}
            <View style={previewCardStyles.bottomContentRow}>
              <View style={previewCardStyles.textContent}>
                {/* Caption */}
                <Text
                  style={previewCardStyles.caption}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {caption}
                </Text>

                {/* Location and Tag Row */}
                <View style={previewCardStyles.locationTagRow}>
                  <Ionicons
                    name="location"
                    size={CARD_WIDTH * 0.053}
                    color={COLORS.white}
                    style={{
                      marginRight: CARD_WIDTH * 0.01,
                      marginBottom: CARD_HEIGHT * 0.005,
                    }}
                  />
                  <Text style={previewCardStyles.location}>{location}</Text>
                  <Text style={previewCardStyles.tag}>{tag}</Text>
                </View>
              </View>

              <View style={previewCardStyles.userInfo}>
                <View style={previewCardStyles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={CARD_WIDTH * 0.099}
                    color={COLORS.textSecondary}
                  />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/create")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
      </View>

      {/* Preview Food Card */}
      <View style={styles.contentFrame}>
        <PreviewFoodCard
          title={title}
          tag={tag}
          location={location}
          caption={caption}
          image={image}
          imageBase64={imageBase64}
          rating={parseInt(rating)}
        />
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



const previewCardStyles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_WIDTH * 0.053,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: CARD_HEIGHT * 0.015 },
    shadowOpacity: 0.25,
    shadowRadius: CARD_WIDTH * 0.04,
    elevation: CARD_WIDTH * 0.066,
    marginVertical: 10,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_WIDTH * 0.053,
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
    borderRadius: CARD_WIDTH * 0.053,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: CARD_WIDTH * 0.053,
    paddingBottom: CARD_HEIGHT * 0.031,
    zIndex: 1,
  },
  titleRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  foodcardTitle: {
    fontSize: CARD_WIDTH * 0.08,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    flex: 1,
    marginRight: CARD_WIDTH * 0.026,
  },
  ratingRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bottomContentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  textContent: {
    flex: 1,
    marginRight: CARD_WIDTH * 0.04,
  },
  caption: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.038,
    fontWeight: "400",
    opacity: 0.7,
    color: COLORS.white,
    marginBottom: CARD_HEIGHT * 0.012,
    lineHeight: CARD_WIDTH * 0.055,
    top: -CARD_HEIGHT * 0.02,
  },
  locationTagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    bottom: -CARD_HEIGHT * 0.012,
  },
  location: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.053,
    color: COLORS.white,
    marginRight: CARD_WIDTH * 0.02,
  },
  tag: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.053,
    color: COLORS.white,
    opacity: 0.7,
    marginLeft: CARD_WIDTH * 0.02,
  },
  userInfo: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarPlaceholder: {
    width: CARD_WIDTH * 0.198,
    height: CARD_WIDTH * 0.198,
    borderRadius: CARD_WIDTH * 0.099,
    backgroundColor: COLORS.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
});
