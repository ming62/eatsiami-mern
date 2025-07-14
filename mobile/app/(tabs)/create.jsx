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

const CARD_WIDTH = 303;
const CARD_HEIGHT = 517;
const CARD_ASPECT_RATIO = 9 / 16;

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
      if (cameraRef.current) {
        cameraRef.current = null;
      }
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
    if (cameraRef.current) {
      try {
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
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
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
        <CameraView ref={cameraRef} style={cameraStyles.camera} facing="back" />

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
          >
            <View style={cameraStyles.captureButtonInner} />
          </TouchableOpacity>

          <View style={cameraStyles.emptySpace} />
        </View>
      </View>
    );
  }

  const renderCardRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= rating; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={CARD_WIDTH * 0.066 * 0.7}
          color={i <= rating ? "#F4B400" : COLORS.textSecondary}
          style={{ marginRight: CARD_WIDTH * 0.0066 * 0.7 }}
        />
      );
    }
    return (
      <View
        style={{
          flexDirection: "row",
          marginBottom: -CARD_HEIGHT * 0.015 * 0.7,
        }}
      >
        {stars}
      </View>
    );
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

          {image && (
            <TouchableOpacity
              style={foodCardStyles.retakeOverlay}
              onPress={retakePhoto}
            >
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={foodCardStyles.retakeText}>Retake</Text>
            </TouchableOpacity>
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
            <View style={foodCardStyles.userInfo}>
              <View style={foodCardStyles.avatarPlaceholder}>
                <Ionicons
                  name="person"
                  size={30}
                  color={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={foodCardStyles.foodcardDetails}>
              <View style={foodCardStyles.ratingContainer}>
                <Text style={foodCardStyles.foodcardTitle}>
                  {title || "Food Title"}
                </Text>
                {renderCardRatingStars(rating)}
              </View>
              <Text style={foodCardStyles.caption}>
                {caption || "Add your caption here..."}
              </Text>
              <View style={foodCardStyles.tagContainer}>
                <View style={foodCardStyles.locationContainer}>
                  <Text style={foodCardStyles.location}>
                    {location || "Location"}
                  </Text>
                </View>
                <View style={foodCardStyles.locationContainer}>
                  <Text style={foodCardStyles.location}>
                    {selectedTag || "Tag"}
                  </Text>
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
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Create</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>{renderFoodCardPreview()}</View>

            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter title"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            {/* Tag */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tag:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {tagOptions.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      {
                        backgroundColor:
                          selectedTag === tag
                            ? COLORS.primary
                            : COLORS.grayLight,
                      },
                    ]}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagInput,
                        { color: selectedTag === tag ? "white" : "black" },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location here"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            {/* Caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption:</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your caption here..."
                value={caption}
                onChangeText={setCaption}
                placeholderTextColor={COLORS.placeholderText}
                multiline
              />
            </View>

            {/* Rating */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating:</Text>
              {renderRatingPicker()}
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

const foodCardStyles = {
  cardContainer: {
    height: CARD_HEIGHT * 0.7,
    width: CARD_WIDTH * 0.7,
    backgroundColor: COLORS.cardBackground,
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
    aspectRatio: CARD_ASPECT_RATIO,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: CARD_HEIGHT * 0.7 * 0.015,
    },
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
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    borderRadius: CARD_WIDTH * 0.7 * 0.053,
  },
  userInfo: {
    position: "absolute",
    alignItems: "center",
    bottom: CARD_HEIGHT * 0.7 * 0.031,
    right: CARD_WIDTH * 0.7 * 0.053,
  },
  avatarPlaceholder: {
    width: CARD_WIDTH * 0.7 * 0.198,
    height: CARD_WIDTH * 0.7 * 0.198,
    borderRadius: CARD_WIDTH * 0.7 * 0.099,
    backgroundColor: COLORS.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  foodcardDetails: {
    paddingHorizontal: CARD_WIDTH * 0.7 * 0.053,
    paddingBottom: CARD_HEIGHT * 0.7 * 0.031,
    marginTop: 0,
    zIndex: 1,
  },
  foodcardTitle: {
    fontSize: CARD_WIDTH * 0.7 * 0.099,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginRight: CARD_WIDTH * 0.7 * 0.026,
    marginVertical: CARD_HEIGHT * 0.7 * -0.006,
  },
  ratingContainer: {
    flexDirection: "row",
    marginVertical: CARD_HEIGHT * 0.7 * 0.015,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: CARD_HEIGHT * 0.7 * 0.023,
  },
  caption: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.7 * 0.046,
    color: COLORS.white,
    marginTop: CARD_HEIGHT * 0.7 * 0.008,
    marginBottom: CARD_HEIGHT * 0.7 * 0.015,
    lineHeight: CARD_WIDTH * 0.7 * 0.066,
    top: -(CARD_HEIGHT * 0.7) * 0.023,
  },
  tagContainer: {
    flexDirection: "row",
  },
  locationContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: CARD_WIDTH * 0.7 * 0.04,
    paddingHorizontal: CARD_WIDTH * 0.7 * 0.026,
    paddingVertical: CARD_HEIGHT * 0.7 * 0.008,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    marginEnd: CARD_WIDTH * 0.7 * 0.016,
  },
  location: {
    fontFamily: "Konkhmer_Sleokchher-Regular",
    fontSize: CARD_WIDTH * 0.7 * 0.04,
    color: COLORS.white,
    textAlign: "center",
    textAlignVertical: "center",
  },
};

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
    left: 20,
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
    borderRadius: 50,
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
