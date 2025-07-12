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
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function Create() {
  const [title, setTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [rating, setRating] = useState(3);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  
  // Camera states
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

  // Request camera permissions when component mounts
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

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

  // Simple take picture - no cropping, just convert to base64
const takePicture = async () => {
  if (cameraRef.current) {
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false, // Don't get base64 initially to save memory
      });
      
      // Resize and compress the image to match gallery processing
      const processedImage = await manipulateAsync(
        photo.uri,
        [
          {
            resize: {
              width: 1080, // Standard width, maintains aspect ratio
            },
          },
        ],
        {
          compress: 0.7, // Same compression as gallery
          format: SaveFormat.JPEG,
          base64: true, // Get base64 after processing
        }
      );
      
      setImage(processedImage.uri);
      setImageBase64(processedImage.base64);
      setShowCamera(false);
      
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  }
};

  // Gallery picker with cropping
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
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

  // Camera permission check
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
        <Ionicons name="camera-outline" size={80} color={COLORS.textSecondary} />
        <Text style={cameraStyles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={cameraStyles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={cameraStyles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[cameraStyles.permissionButton, { backgroundColor: COLORS.textSecondary }]}
          onPress={() => router.back()}
        >
          <Text style={cameraStyles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera Interface with frame overlay
  if (showCamera) {
    return (
      <View style={cameraStyles.container}>
        <CameraView
          ref={cameraRef}
          style={cameraStyles.camera}
          facing="back"
        />
        
        {/* Frame overlay to show 9:16 crop area */}
        <View style={cameraStyles.frameOverlay}>
          <View style={cameraStyles.frame} />
        </View>
        
        {/* Header */}
        <View style={cameraStyles.header}>
          <TouchableOpacity onPress={handleBack} style={cameraStyles.backButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Text style={cameraStyles.headerTitle}>Take Photo</Text>
          <View style={cameraStyles.placeholder} />
        </View>

        {/* Bottom Controls */}
        <View style={cameraStyles.bottomControls}>
          <TouchableOpacity
            style={cameraStyles.galleryButton}
            onPress={pickFromGallery}
          >
            <Ionicons name="images-outline" size={30} color="white" />
            <Text style={cameraStyles.controlText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cameraStyles.captureButton}
            onPress={takePicture}
          >
            <View style={cameraStyles.captureButtonInner} />
          </TouchableOpacity>

          <View style={cameraStyles.placeholder} />
        </View>
      </View>
    );
  }

  // Form Interface (after taking/selecting photo)
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
            <TouchableOpacity onPress={retakePhoto} style={styles.retakeHeaderButton}>
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
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

// Simplified camera styles with frame overlay
const cameraStyles = {
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  frame: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7 * (16/9), // 9:16 aspect ratio
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};