import {
  View,
  Platform,
  Alert,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import COLORS from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "../../../store/authStore";
import { API_URL } from "../../../constants/api";

export default function UpdateProfile() {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();

  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [profileImage, setProfileImage] = useState(user.profileImage);
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
      }

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
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not access media library. Please try again.");
      return;
    }
  };

  const handleUpdate = async () => {
    if (!username || !bio || !profileImage) {
      Alert.alert("Please fill in all fields.");
      return;
    }
    setIsLoading(true);

    try {
      const uriParts = profileImage.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const res = await fetch(`${API_URL}/users/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          profileImage: imageDataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={updateStyles.scrollViewContainer}
        style={updateStyles.scrollViewStyle}
      >
        {/* Header */}
        <View style={updateStyles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={updateStyles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={updateStyles.headerTitle}>Edit Profile</Text>
          <View style={updateStyles.rightSpace} />
        </View>

        <View style={updateStyles.container}>
          {/* Avatar */}
          <View style={updateStyles.avatarContainer}>
            <TouchableOpacity
              style={updateStyles.avatarPicker}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={updateStyles.avatarImage}
                />
              ) : (
                <View style={updateStyles.avatarPlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={COLORS.textSecondary}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Username */}
          <View style={updateStyles.formGroup}>
            <Text style={updateStyles.inputLabel}>username</Text>
            <TextInput
              style={updateStyles.textInput}
              placeholder=""
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={COLORS.placeholderText}
              autoCapitalize="none"
            />
          </View>

          {/* Bio */}
          <View style={updateStyles.formGroup}>
            <Text style={updateStyles.inputLabel}>bio</Text>
            <TextInput
              style={updateStyles.textArea}
              placeholder=""
              value={bio}
              onChangeText={setBio}
              placeholderTextColor={COLORS.placeholderText}
              multiline
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={updateStyles.button}
            onPress={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={updateStyles.buttonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const updateStyles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 70,
    paddingTop: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  rightSpace: {
    width: 40,
    height: 40,
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
    position: "relative",
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
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
  textArea: {
    minHeight: 120,
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
  imagePicker: {
    width: "100%",
    height: 180,
    backgroundColor: "#f7f4f1",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#ccc9c6",
    overflow: "hidden",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  placeholderText: {
    color: "#8e8e8e",
    fontSize: 13,
    marginTop: 8,
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
  },

  formContainer: {
    paddingHorizontal: 53,
    marginTop: 32,
  },
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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarPicker: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#f7f4f1",
    borderWidth: 3,
    borderColor: "#ccc9c6",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
  },
});
