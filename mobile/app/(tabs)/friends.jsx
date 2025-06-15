import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "../../assets/styles/friends.styles";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";

export default function Friends() {
  // State Management
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  // Fetch Friends List
  useEffect(() => {
    fetchFriends();
  }, []);

  //friends card for added friends
  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => router.push(`/profile/${item._id}`)}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={searchTerm}
            onFocus={() => router.push("otherpage/search")}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Friends List Section */}
      <View style={styles.friendsSection}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
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
