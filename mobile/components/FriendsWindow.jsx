import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { API_URL } from "../constants/api";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "expo-router";
import COLORS from "../constants/colors";

const FriendsWindow = ({ visible, onClose, foodcardId }) => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/friends`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch friends");
      }

      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", error.message || "Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (friend) => {
    try {
      setSharing(friend._id);

      const response = await fetch(`${API_URL}/chat/share-foodcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodcardId: foodcardId,
          recipientId: friend._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share foodcard");
      }
      
      Alert.alert("Success", "Foodcard shared successfully!", [
        {
          text: "OK",
          onPress: () => {
            onClose();
            router.push({
              pathname: "/otherpage/chatPage",
              params: {
                friendId: friend._id,
                friendName: friend.username,
                friendImage: friend.profileImage,
              },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error sharing foodcard:", error);
      Alert.alert("Error", error.message || "Failed to share foodcard");
    } finally {
      setSharing(null);
    }
  };

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleShare(item)}
      disabled={sharing === item._id}
    >
      <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
      </View>
      {sharing === item._id ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons name="share-social" size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share Foodcard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.lightBlackText} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={50}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>No friends to share with</Text>
                <Text style={styles.emptySubtext}>
                  Add some friends to start sharing!
                </Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item._id}
                renderItem={renderFriend}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Konkhmer_Sleokchher-Regular",
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    color: COLORS.lightBlackText,
    fontFamily: "Konkhmer_Sleokchher-Regular",
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightBlackText,
    textAlign: "center",
  },
});

export default FriendsWindow;