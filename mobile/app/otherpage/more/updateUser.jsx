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
} from "react-native";
import { Image } from "expo-image";

import { useRouter } from "expo-router";
import { useState } from "react";
import styles from "../../../assets/styles/updateUser.styles";
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
        contentContainerStyle={styles.scrollViewContainer}
        style={styles.scrollViewStyle}
      >
        {/* header */}
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.backButton} />
          </View>

          {/* Avatar */}
          <View style={styles.formGroup}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.placeholderText}>
                    Pick a profile picture
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio:</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Introduce yourself..."
                value={bio}
                onChangeText={setBio}
                placeholderTextColor={COLORS.placeholderText}
                multiline
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
