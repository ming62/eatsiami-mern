import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "../../assets/styles/friends.styles";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { Image } from "expo-image";

export default function Friends() {
  // State Management
  const { token, perChannelUnread, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [outgoingJioRequestIds, setOutgoingJioRequestIds] = useState(new Set());
  const router = useRouter();

  const onRefresh = useCallback(() => {
    fetchFriends(true);
    fetchOutgoingJioRequests(true);
  }, []);

  const fetchFriends = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
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
      if (refresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const fetchOutgoingJioRequests = async (refresh = false) => {
    try {
      const response = await fetch(`${API_URL}/users/outgoing-jio-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch outgoing requests"
        );
      }

      const data = await response.json();

      const ids = new Set(data.map((req) => req.recipient._id));
      setOutgoingJioRequestIds(ids);
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
    }
  };

  const handleSendJioRequest = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/jio-request/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send jio request");
      }

      setOutgoingJioRequestIds((prev) => new Set(prev).add(userId));

      Alert.alert("Success", "Jio request sent successfully!");
    } catch (error) {
      console.error("Error sending jio request:", error);
      Alert.alert("Error", error.message || "Failed to send jio request");
    }
  };

  const handleDeleteFriend = async (requestId) => {
    try {
      const response = await fetch(
        `${API_URL}/users/deleteFriend/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to delete friend request`);
      }

      setFriends((prev) => prev.filter((friend) => friend._id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  // Fetch Friends List
  useEffect(() => {
    fetchFriends();
    fetchOutgoingJioRequests();
  }, []);

  //friends card for added friends
  const renderFriend = ({ item }) => {
    const userId = user?.id;
    if (!userId) return null;

    const sortedIds = [userId, item._id].sort();

    const channelId = `${sortedIds.join("-")}`;

    const unreadCount = perChannelUnread?.[channelId] ?? 0;
    const requestAlreadySent = outgoingJioRequestIds.has(item._id);
    return (
      <View style={styles.friendCard}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            router.push(`/otherpage/friendDetail?friendId=${item._id}`)
          }
        >
          <Image
            source={{ uri: item.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>
            {item.username.length > 12
              ? item.username.slice(0, 10) + "..."
              : item.username}
          </Text>
        </TouchableOpacity>

        {/* Chat Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "/otherpage/chatPage",
              params: {
                friendId: item._id,
                friendName: item.username,
                friendImage: item.profileImage,
              },
            })
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#ffffff"
          />
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.addButton,
            requestAlreadySent && { backgroundColor: "#d3d3d3" },
          ]}
          onPress={() => handleSendJioRequest(item._id)}
          disabled={requestAlreadySent}
        >
          <Ionicons name="restaurant-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this friend?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteFriend(item._id),
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#6a6968" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={30}
          color={COLORS.textSecondary}
          style={{ marginLeft: 5 }}
        />
        <TextInput
          style={styles.searchText}
          accessibilityLabel="search bar"
          placeholder="search by username..."
          value={searchTerm}
          onFocus={() => router.push("otherpage/search")}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Friends List Section */}
      <View style={styles.friendsSection}>
        {isLoading ? (
          <Loader />
        ) : friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
          />
        ) : (
          <Text style={styles.emptyText}>
            No friends yet. Start adding some!
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
