import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfilePreview() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();

  const [profileImage, setProfileImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Sorry, we need camera roll permissions to make this work!"
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not access media library. Please try again.");
      return;
    }
  };

  const handleUpdate = async () => {
    if (!profileImage || !imageBase64) {
      Alert.alert("Please select an image.");
      return;
    }

    try {
      setIsLoading(true);
      const imageData = `data:image/jpeg;base64,${imageBase64}`;

      const res = await fetch(`${API_URL}/users/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImage: imageData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile image");
      }

      setUser(data.user);
      Alert.alert("Success", "Image updated successfully!");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.username}!</Text>
      </View>

      <View style={styles.centerContent}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name="person"
                size={80}
                color={COLORS.textSecondary}
              />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.9}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#ff5f00", "#ff8c00", "#ffb300"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c2c2c",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#2c2c2c",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  imagePicker: {
    position: "relative",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
    opacity: 0.7,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  buttonContainer: {
    paddingHorizontal: 70,
    paddingBottom: 80,
    backgroundColor: COLORS.white,
  },
  updateButton: {
    width: "100%",
    height: 65,
    marginTop: 20,
    marginBottom: 6,
    borderRadius: 18,
  },
  updateButtonGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  skipButton: {
    alignItems: "center",
    marginTop: 5,
  },
  skipButtonText: {
    fontSize: 15,
    color: "#f27609",
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
});
