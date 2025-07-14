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
import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_RATIO = 9 / 16;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;
const CARD_WIDTH = CARD_HEIGHT * CARD_RATIO;

export default function Create() {
  const [title, setTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [rating, setRating] = useState(3);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showCamera, setShowCamera] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  const tagOptions = [
    "breakfast",
    "lunch",
    "dinner",
    "supper",
    "snack",
    "others",
  ];

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (!permission?.granted) {
        requestPermission();
      }
      setShowCamera(true);
      setImage(null);
      setImageBase64(null);
      return () => {
        setShowCamera(false);
      };
    }, [permission])
  );

  const handleBack = () => {
    if (showCamera) {
      router.back();
      return;
    }

    if (title || selectedTag || location || caption || image || rating !== 3) {
      Alert.alert(
        "Discard Changes?",
        "Would you want to discard your changes?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setTitle("");
              setSelectedTag("");
              setLocation("");
              setCaption("");
              setImage(null);
              setImageBase64(null);
              setRating(3);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady && !isCapturing) {
      try {
        setIsCapturing(true);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1.0,
          base64: false,
        });

        const sourceAspectRatio = photo.width / photo.height;
        const targetAspectRatio = 9 / 16;
        let cropData;

        if (sourceAspectRatio > targetAspectRatio) {
          const cropWidth = photo.height * targetAspectRatio;
          cropData = {
            originX: (photo.width - cropWidth) / 2,
            originY: 0,
            width: cropWidth,
            height: photo.height,
          };
        } else {
          const cropHeight = photo.width / targetAspectRatio;
          cropData = {
            originX: 0,
            originY: (photo.height - cropHeight) / 2,
            width: photo.width,
            height: cropHeight,
          };
        }

        const context = ImageManipulator.manipulate(photo.uri);
        context.crop(cropData);
        context.resize({ width: 1080 });

        const processedImageRef = await context.renderAsync();
        const processedImage = await processedImageRef.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.7,
          base64: true,
        });

        setImage(processedImage.uri);
        setImageBase64(processedImage.base64);
        setShowCamera(false);
        console.log("Image taken successfully:", processedImage.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled) {
        const context = ImageManipulator.manipulate(result.assets[0].uri);
        context.resize({ width: 1080 });

        const processedImageRef = await context.renderAsync();
        const processedImage = await processedImageRef.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.7,
          base64: true,
        });

        setImage(processedImage.uri);
        setImageBase64(processedImage.base64);
        setShowCamera(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not access media library. Please try again.");
    }
  };

  const retakePhoto = () => {
    setImage(null);
    setImageBase64(null);
    setShowCamera(true);
  };

  const handlePreview = async () => {
    if (
      !title ||
      !caption ||
      !imageBase64 ||
      !rating ||
      !location ||
      !selectedTag
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    router.push({
      pathname: "otherpage/preview",
      params: {
        title,
        tag: selectedTag,
        location,
        caption,
        image,
        imageBase64,
        rating: rating.toString(),
      },
    });
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  if (!permission) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={cameraStyles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <Ionicons
          name="camera-outline"
          size={80}
          color={COLORS.textSecondary}
        />
        <Text style={cameraStyles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={cameraStyles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={cameraStyles.permissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            cameraStyles.permissionButton,
            { backgroundColor: COLORS.textSecondary },
          ]}
          onPress={() => router.back()}
        >
          <Text style={cameraStyles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={cameraStyles.container}>
        <CameraView
          ref={cameraRef}
          style={cameraStyles.camera}
          facing="back"
          onCameraReady={() => setIsCameraReady(true)}
        />

        <TouchableOpacity onPress={handleBack} style={cameraStyles.backButton}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>

        <View style={cameraStyles.bottomControls}>
          <TouchableOpacity
            style={cameraStyles.galleryButton}
            onPress={pickFromGallery}
          >
            <Ionicons name="images-outline" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={cameraStyles.captureButton}
            onPress={takePicture}
            disabled={!isCameraReady || isCapturing}
          >
            <View style={cameraStyles.captureButtonInner} />
          </TouchableOpacity>

          <View style={cameraStyles.emptySpace} />
        </View>
      </View>
    );
  }

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= rating; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={CARD_WIDTH * 0.7 * 0.066}
          color={COLORS.starColor}
          style={{
            marginRight: CARD_WIDTH * 0.7 * 0.0066,
            marginBottom: CARD_HEIGHT * 0.7 * 0.005,
          }}
        />
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  const renderFoodCardPreview = () => {
    return (
      <View style={foodCardStyles.cardContainer}>
        <View style={foodCardStyles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={foodCardStyles.cardImage} />
          ) : (
            <View style={foodCardStyles.placeholderContainer}>
              <Ionicons
                name="camera-outline"
                size={60}
                color={COLORS.textSecondary}
              />
              <Text style={foodCardStyles.placeholderText}>Take a photo</Text>
            </View>
          )}

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
            style={foodCardStyles.gradientOverlay}
          >
            <View style={foodCardStyles.detailsContainer}>
              {/* Title and Rating Row */}
              <View style={foodCardStyles.titleRatingRow}>
                <Text
                  style={foodCardStyles.foodcardTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title || "Food Title"}
                </Text>
                <View style={foodCardStyles.ratingRight}>
                  {renderRatingStars(rating)}
                </View>
              </View>

              {/* Caption, Location and User Profile Picture Row */}
              <View style={foodCardStyles.bottomContentRow}>
                <View style={foodCardStyles.textContent}>
                  {/* Caption */}
                  <Text
                    style={foodCardStyles.caption}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {caption || "Add your caption here..."}
                  </Text>

                  {/* Location and Tag Row */}
                  <View style={foodCardStyles.locationTagRow}>
                    <Ionicons
                      name="location"
                      size={CARD_WIDTH * 0.7 * 0.053}
                      color={COLORS.white}
                      style={{
                        marginRight: CARD_WIDTH * 0.7 * 0.01,
                        marginBottom: CARD_HEIGHT * 0.7 * 0.005,
                      }}
                    />
                    <Text style={foodCardStyles.location}>
                      {location || "Location"}
                    </Text>
                    <Text style={foodCardStyles.tag}>
                      {selectedTag || "Tag"}
                    </Text>
                  </View>
                </View>

                <View style={foodCardStyles.userInfo}>
                  <View style={foodCardStyles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={CARD_WIDTH * 0.7 * 0.099}
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
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        style={styles.scrollViewStyle}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create</Text>
          <TouchableOpacity
            style={styles.retakeHeaderButton}
            onPress={retakePhoto}
          >
            <Ionicons name="camera-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.form}>
            <View style={styles.formGroup}>{renderFoodCardPreview()}</View>

            {/* Title */}
            <View style={inputStyles.inputContainer}>
              <Text style={inputStyles.inputLabel}>title</Text>
              <TextInput
                style={inputStyles.textInput}
                placeholder=""
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={COLORS.placeholderText}
                autoCapitalize="sentences"
              />
            </View>

            {/* Location */}
            <View style={inputStyles.inputContainer}>
              <Text style={inputStyles.inputLabel}>location</Text>
              <TextInput
                style={inputStyles.textInput}
                placeholder=""
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={COLORS.placeholderText}
                autoCapitalize="sentences"
                maxLength={8}
              />
            </View>

            {/* Caption */}
            <View style={inputStyles.inputContainer}>
              <Text style={inputStyles.inputLabel}>caption</Text>
              <TextInput
                style={inputStyles.textArea}
                placeholder=""
                value={caption}
                onChangeText={setCaption}
                placeholderTextColor={COLORS.placeholderText}
                multiline
              />
            </View>

            <View style={inputStyles.inputContainer}>
              <View style={inputStyles.tagInputRow}>
                {tagOptions.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      inputStyles.tagButton,
                      {
                        backgroundColor:
                          selectedTag === tag
                            ? COLORS.primary
                            : COLORS.searchBarBackground,
                      },
                    ]}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text
                      style={[
                        inputStyles.tagText,
                        {
                          color:
                            selectedTag === tag
                              ? "white"
                              : COLORS.searchBarLabel,
                        },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={inputStyles.ratingInputRow} paddingTop={24}>
                {renderRatingPicker()}
              </View>
            </View>

            {/* Preview Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Preview Food Card</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const inputStyles = StyleSheet.create({
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
  textArea: {
    minHeight: 90,
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 18,
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 16,
    color: COLORS.searchBarText,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontWeight: "400",
    textAlignVertical: "top",
  },

  tagInputRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: 12,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.searchBarText,
  },
});

const foodCardStyles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT * 0.7,
    width: CARD_WIDTH * 0.7,
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: CARD_HEIGHT * 0.7 * 0.015 },
    shadowOpacity: 0.25,
    shadowRadius: CARD_WIDTH * 0.7 * 0.04,
    elevation: CARD_WIDTH * 0.7 * 0.066,
    marginVertical: 10,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
    backgroundColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
    contentFit: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: CARD_WIDTH * 0.7 * 0.053,
    paddingBottom: CARD_HEIGHT * 0.7 * 0.031,
    zIndex: 1,
  },
  titleRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  foodcardTitle: {
    fontSize: CARD_WIDTH * 0.7 * 0.08,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    flex: 1,
    marginRight: CARD_WIDTH * 0.7 * 0.026,
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
    marginRight: CARD_WIDTH * 0.7 * 0.04,
  },
  caption: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.7 * 0.038,
    fontWeight: "400",
    opacity: 0.7,
    color: COLORS.white,
    marginBottom: CARD_HEIGHT * 0.7 * 0.012,
    lineHeight: CARD_WIDTH * 0.7 * 0.055,
    top: -CARD_HEIGHT * 0.7 * 0.02,
  },
  locationTagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    bottom: -CARD_HEIGHT * 0.7 * 0.012,
  },
  location: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.7 * 0.053,
    color: COLORS.white,
    marginRight: CARD_WIDTH * 0.7 * 0.02,
  },
  tag: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.7 * 0.053,
    color: COLORS.white,
    opacity: 0.7,
    marginLeft: CARD_WIDTH * 0.7 * 0.02,
  },
  userInfo: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarPlaceholder: {
    width: CARD_WIDTH * 0.7 * 0.198,
    height: CARD_WIDTH * 0.7 * 0.198,
    borderRadius: CARD_WIDTH * 0.7 * 0.099,
    backgroundColor: COLORS.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  retakeOverlay: {
    position: "absolute",
    top: CARD_HEIGHT * 0.7 * 0.019,
    right: CARD_WIDTH * 0.7 * 0.033,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CARD_WIDTH * 0.7 * 0.026,
    paddingVertical: CARD_HEIGHT * 0.7 * 0.012,
    borderRadius: CARD_WIDTH * 0.7 * 0.04,
    zIndex: 2,
  },
  retakeText: {
    color: "white",
    fontSize: CARD_WIDTH * 0.7 * 0.033,
    marginLeft: CARD_WIDTH * 0.7 * 0.013,
    fontWeight: "500",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.grayLight,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: CARD_WIDTH * 0.7 * 0.046,
    marginTop: CARD_HEIGHT * 0.7 * 0.015,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});

const cameraStyles = {
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 40,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    zIndex: 2,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
    paddingTop: 30,
    zIndex: 2,
  },
  galleryButton: {
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  emptySpace: {
    width: 50,
    height: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginVertical: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
};
